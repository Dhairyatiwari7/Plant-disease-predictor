import logging
import torch
import json
import numpy as np
from pathlib import Path
from PIL import Image
from torchvision import transforms
from config import MODEL_PATH, CLASS_NAMES

logger = logging.getLogger(__name__)


class ModelLoader:
    """Handles loading and inference with the tomato disease detection model."""

    _model = None
    _device = None
    _transform = None
    _class_names = None

    @classmethod
    def initialize(cls):
        """Initialize the model on first use."""
        if cls._model is not None:
            return  # Already initialized

        try:
            cls._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Using device: {cls._device}")

            model_dir = Path(MODEL_PATH)

            # Locate the best saved checkpoint
            model_file = None
            if (model_dir / "best_model_final.pth").exists():
                model_file = model_dir / "best_model_final.pth"
            else:
                pth_files = list(model_dir.glob("*.pth"))
                if pth_files:
                    model_file = pth_files[0]

            if model_file is None:
                raise FileNotFoundError(
                    f"No model file (.pth) found in {model_dir}. "
                    "Run the training notebook and copy saved_models/ here."
                )

            logger.info(f"Loading model from: {model_file}")

            # Load class names (prefer JSON saved alongside weights)
            class_names_file = model_dir / "class_names.json"
            if class_names_file.exists():
                with open(class_names_file, "r") as f:
                    cls._class_names = json.load(f)
                logger.info(f"Loaded {len(cls._class_names)} classes from JSON")
            else:
                cls._class_names = CLASS_NAMES
                logger.info("Using default class names from config")

            num_classes = len(cls._class_names)

            # Build architecture (must match training checkpoint exactly)
            from model_architecture import ModifiedGoogLeNet
            cls._model = ModifiedGoogLeNet(num_classes=num_classes)

            # Load checkpoint weights
            checkpoint = torch.load(
                model_file, map_location=cls._device, weights_only=False
            )

            if isinstance(checkpoint, dict):
                # Training notebook saves under 'model_state' key
                if "model_state" in checkpoint:
                    state_dict = checkpoint["model_state"]
                    fold = checkpoint.get("fold", "?")
                    val_f1 = checkpoint.get("val_f1", "?")
                    logger.info(
                        f"Checkpoint: fold={fold}, val_f1={val_f1}"
                    )
                elif "model_state_dict" in checkpoint:
                    state_dict = checkpoint["model_state_dict"]
                elif "state_dict" in checkpoint:
                    state_dict = checkpoint["state_dict"]
                else:
                    # Assume the dict itself is the state dict
                    state_dict = checkpoint

                missing, unexpected = cls._model.load_state_dict(
                    state_dict, strict=False
                )
                if missing:
                    logger.warning(f"Missing keys in checkpoint: {missing}")
                if unexpected:
                    logger.warning(f"Unexpected keys in checkpoint: {unexpected}")
                # Fail hard if there are any structural mismatches
                if missing or unexpected:
                    raise RuntimeError(
                        "Architecture mismatch between model_architecture.py and the "
                        "saved checkpoint. Ensure model_architecture.py matches the "
                        "training notebook exactly.\n"
                        f"  Missing keys   : {missing}\n"
                        f"  Unexpected keys: {unexpected}"
                    )
            else:
                # Saved as a full model object (rare)
                cls._model = checkpoint

            cls._model.to(cls._device)
            cls._model.eval()
            logger.info("Model initialized and ready for inference")

            # Inference transform — identical to val_transform in training
            cls._transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ])

        except Exception as e:
            # Reset so the next request retries initialization
            cls._model = None
            logger.error(f"Failed to initialize model: {e}")
            raise

    @classmethod
    def predict(cls, image_path: str) -> dict:
        """
        Perform inference on an image and return predictions.

        Args:
            image_path: Path to the image file.

        Returns:
            Dictionary with predicted_class, confidence, top_3_predictions,
            and all_probabilities.
        """
        cls.initialize()

        try:
            image = Image.open(image_path).convert("RGB")
            image_tensor = cls._transform(image).unsqueeze(0).to(cls._device)

            with torch.no_grad():
                outputs = cls._model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted_idx = torch.max(probabilities, 1)

            predicted_class_idx = predicted_idx.item()
            confidence_score = confidence.item()
            predicted_class = cls._class_names[predicted_class_idx]

            k = min(3, len(cls._class_names))
            top_k_probs, top_k_indices = torch.topk(probabilities[0], k=k)
            top_3_predictions = [
                {
                    "class": cls._class_names[idx.item()],
                    "confidence": float(prob.item()),
                }
                for prob, idx in zip(top_k_probs, top_k_indices)
            ]

            return {
                "predicted_class": predicted_class,
                "confidence": float(confidence_score),
                "top_3_predictions": top_3_predictions,
                "all_probabilities": {
                    cls._class_names[i]: float(probabilities[0][i].item())
                    for i in range(len(cls._class_names))
                },
            }

        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            raise RuntimeError(f"Failed to perform prediction: {str(e)}")