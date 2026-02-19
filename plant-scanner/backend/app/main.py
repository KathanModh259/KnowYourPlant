from fastapi import FastAPI, File, UploadFile
from app.model import predict_image

app = FastAPI()

@app.post("/predict-image")
async def predict(file: UploadFile = File(...)):
    result = await predict_image(file)
    return result
