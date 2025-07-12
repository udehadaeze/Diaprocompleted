from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Medication
from app.schemas import Medication as MedicationSchema, MedicationCreate, MedicationUpdate
from app.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[MedicationSchema])
def get_medications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    medications = db.query(Medication).filter(Medication.user_id == current_user.id).all()
    return medications

@router.post("/", response_model=MedicationSchema)
def create_medication(
    medication: MedicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_medication = Medication(
        user_id=current_user.id,
        name=medication.name,
        medication_type=medication.medication_type,
        schedule=medication.schedule
    )
    db.add(db_medication)
    db.commit()
    db.refresh(db_medication)
    return db_medication

@router.get("/{medication_id}", response_model=MedicationSchema)
def get_medication(
    medication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medication = db.query(Medication).filter(
        Medication.id == medication_id,
        Medication.user_id == current_user.id
    ).first()
    
    if medication is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    return medication

@router.put("/{medication_id}", response_model=MedicationSchema)
def update_medication(
    medication_id: int,
    medication_update: MedicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medication = db.query(Medication).filter(
        Medication.id == medication_id,
        Medication.user_id == current_user.id
    ).first()
    
    if medication is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    # Update fields
    if medication_update.name is not None:
        medication.name = medication_update.name
    if medication_update.medication_type is not None:
        medication.medication_type = medication_update.medication_type
    if medication_update.schedule is not None:
        medication.schedule = medication_update.schedule
    
    db.commit()
    db.refresh(medication)
    return medication

@router.delete("/{medication_id}")
def delete_medication(
    medication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medication = db.query(Medication).filter(
        Medication.id == medication_id,
        Medication.user_id == current_user.id
    ).first()
    
    if medication is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    db.delete(medication)
    db.commit()
    
    return {"message": "Medication deleted successfully"} 