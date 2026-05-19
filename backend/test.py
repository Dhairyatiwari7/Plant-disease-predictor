import os
from pathlib import Path

# This mimics exactly how your app calculates paths
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "saved_models"

print(f"--- PATH CHECKER ---")
print(f"Backend directory: {BASE_DIR}")
print(f"Looking for weights in: {MODEL_PATH}")
print(f"Does the folder exist?: {MODEL_PATH.exists()}")

if MODEL_PATH.exists():
    files = os.listdir(MODEL_PATH)
    print(f"Files found inside that folder: {files}")
    pth_files = [f for f in files if f.endswith('.pth')]
    print(f".pth files found: {pth_files}")
    if not pth_files:
        print("\n❌ ERROR: Your folder exists but it does NOT contain any .pth model files.")
else:
    print("\n❌ ERROR: The folder 'saved_models' does not exist at this path.")