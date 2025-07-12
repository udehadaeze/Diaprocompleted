from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, GlucoseReading
from app.schemas import GlucoseReading as GlucoseReadingSchema, GlucoseReadingCreate
from app.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[GlucoseReadingSchema])
def get_glucose_readings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    readings = db.query(GlucoseReading).filter(GlucoseReading.user_id == current_user.id).order_by(GlucoseReading.reading_date.desc()).all()
    return readings

@router.post("/", response_model=GlucoseReadingSchema)
def create_glucose_reading(
    reading: GlucoseReadingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_reading = GlucoseReading(
        user_id=current_user.id,
        value=reading.value
    )
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    return db_reading

@router.get("/{reading_id}", response_model=GlucoseReadingSchema)
def get_glucose_reading(
    reading_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reading = db.query(GlucoseReading).filter(
        GlucoseReading.id == reading_id,
        GlucoseReading.user_id == current_user.id
    ).first()
    
    if reading is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Glucose reading not found"
        )
    
    return reading

@router.delete("/{reading_id}")
def delete_glucose_reading(
    reading_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reading = db.query(GlucoseReading).filter(
        GlucoseReading.id == reading_id,
        GlucoseReading.user_id == current_user.id
    ).first()
    
    if reading is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Glucose reading not found"
        )
    
    db.delete(reading)
    db.commit()
    
    return {"message": "Glucose reading deleted successfully"}

@router.delete("/")
def clear_glucose_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    readings = db.query(GlucoseReading).filter(GlucoseReading.user_id == current_user.id).all()
    for reading in readings:
        db.delete(reading)
    db.commit()
    
    return {"message": "All glucose readings deleted successfully"} 