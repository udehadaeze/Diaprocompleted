from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.routers import auth, users, medications, glucose, calendar, pharmacy, caregiver
from app.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Diapro API",
    description="Backend API for Diapro Diabetes Management Application",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(medications.router, prefix="/api/medications", tags=["Medications"])
app.include_router(glucose.router, prefix="/api/glucose", tags=["Glucose"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(pharmacy.router, prefix="/api/pharmacy", tags=["Pharmacy"])
app.include_router(caregiver.router, prefix="/api/caregiver", tags=["Caregiver"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Diapro API is running"}


if os.path.exists("/app"):
    app.mount("/", StaticFiles(directory="/app", html=True), name="static")


@app.get("/")
async def read_root():
    return FileResponse("/app/index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
