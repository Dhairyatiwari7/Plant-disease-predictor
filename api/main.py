from fastapi import FastAPI, UploadFile, File
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

MODEL = tf.keras.layers.TFSMLayer(
    "../saved_models/1",
    call_endpoint="serving_default"
)

CLASS_NAMES = ['Early_blight', 'Late_blight', 'Healthy']

def read_file_as_image(data: bytes) -> np.ndarray:
    img = BytesIO(data)
    return np.array(Image.open(img))

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = read_file_as_image(await file.read())
    image = np.array(image)
    image = image.astype("float32")

    img_batch = np.expand_dims(image, axis=0)

    predictions = MODEL(img_batch)["output_0"].numpy()

    print(predictions[0])

    output_class = CLASS_NAMES[np.argmax(predictions[0])]
    output_confidence = float(np.max(predictions[0]))
    return {
        "output_class": output_class,
        "output_confidence": round(output_confidence * 100, 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)