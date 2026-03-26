from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.model import predict_image
from app.database import engine, Base
from app import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KnowYourPlant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.post("/api/predict-image")
async def predict(
    file: UploadFile = File(...),
    current_user: auth.models_db.User = Depends(auth.get_current_user)
):
    return await predict_image(file)

@app.get("/api/health")
async def health():
    return {"status": "ok"}
