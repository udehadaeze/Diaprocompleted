from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models import User, CaregiverCode, CaregiverNote
from app.schemas import (
    CaregiverCode as CaregiverCodeSchema,
    CaregiverNote as CaregiverNoteSchema,
    CaregiverNoteCreate,
    Medication,
    GlucoseReading,
    CalendarEvent,
    PharmacyOrder,
)
from app.auth import get_current_user
from app.models import (
    Medication as MedicationModel,
    GlucoseReading as GlucoseReadingModel,
    CalendarEvent as CalendarEventModel,
    PharmacyOrder as PharmacyOrderModel,
)

router = APIRouter()


@router.post("/generate", response_model=CaregiverCodeSchema)
def generate_caregiver_code(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    import secrets
    import string

    while True:
        code = "".join(
            secrets.choice(string.ascii_uppercase + string.digits) for _ in range(16)
        )

        existing_code = (
            db.query(CaregiverCode).filter(CaregiverCode.code == code).first()
        )
        if not existing_code:
            break

    caregiver_code = CaregiverCode(
        code=code,
        user_id=current_user.id,
        is_active=True,
        expires_at=datetime.now(timezone.utc).replace(
            hour=23, minute=59, second=59, microsecond=999999
        ),
    )

    db.add(caregiver_code)
    db.commit()
    db.refresh(caregiver_code)

    print(f"Generated caregiver code: {code} for user: {current_user.id}")
    return caregiver_code


@router.get("/verify/{code}")
def verify_caregiver_code(code: str, db: Session = Depends(get_db)):
    caregiver_code = (
        db.query(CaregiverCode)
        .filter(CaregiverCode.code == code, CaregiverCode.is_active == True)
        .first()
    )

    if caregiver_code is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired caregiver code",
        )

    if caregiver_code.expires_at and caregiver_code.expires_at < datetime.now(
        timezone.utc
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Caregiver code has expired",
        )

    user = db.query(User).filter(User.id == caregiver_code.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    print(
        f"Found code for user: {caregiver_code.user_id}, is_active: {caregiver_code.is_active}"
    )
    print(
        f"Verification successful: {{'valid': True, 'user_id': {user.id}, 'user_name': '{user.username}'}}"
    )

    return {
        "valid": True,
        "user_id": user.id,
        "user_name": user.username,
        "full_name": user.full_name,
    }


@router.post("/notes", response_model=CaregiverNoteSchema)
def create_caregiver_note(
    note_data: CaregiverNoteCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid caregiver code",
        )

    code_value = authorization.replace("Bearer ", "")

    code = (
        db.query(CaregiverCode)
        .filter(CaregiverCode.code == code_value, CaregiverCode.is_active == True)
        .first()
    )

    if code is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired caregiver code",
        )

    if code.expires_at and code.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Caregiver code has expired",
        )

    caregiver_note = CaregiverNote(
        note=note_data.note, user_id=code.user_id, caregiver_code=code_value
    )

    db.add(caregiver_note)
    db.commit()
    db.refresh(caregiver_note)

    return caregiver_note


@router.get("/notes/caregiver", response_model=List[CaregiverNoteSchema])
def get_caregiver_notes_with_code(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid caregiver code",
        )

    code_value = authorization.replace("Bearer ", "")

    code = (
        db.query(CaregiverCode)
        .filter(CaregiverCode.code == code_value, CaregiverCode.is_active == True)
        .first()
    )

    if code is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired caregiver code",
        )

    if code.expires_at and code.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Caregiver code has expired",
        )

    notes = (
        db.query(CaregiverNote)
        .filter(CaregiverNote.user_id == code.user_id)
        .order_by(CaregiverNote.created_at.desc())
        .all()
    )
    return notes


@router.get("/codes", response_model=List[CaregiverCodeSchema])
def get_caregiver_codes(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    codes = (
        db.query(CaregiverCode)
        .filter(CaregiverCode.user_id == current_user.id)
        .order_by(CaregiverCode.created_at.desc())
        .all()
    )
    return codes


@router.get("/notes", response_model=List[CaregiverNoteSchema])
def get_caregiver_notes(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    notes = (
        db.query(CaregiverNote)
        .filter(CaregiverNote.user_id == current_user.id)
        .order_by(CaregiverNote.created_at.desc())
        .all()
    )
    return notes


@router.delete("/notes/{note_id}")
def delete_caregiver_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = (
        db.query(CaregiverNote)
        .filter(CaregiverNote.id == note_id, CaregiverNote.user_id == current_user.id)
        .first()
    )

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver note not found"
        )

    db.delete(note)
    db.commit()

    return {"message": "Caregiver note deleted successfully"}


@router.get("/patient/medications", response_model=List[Medication])
def get_patient_medications_for_caregiver(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    user_id = verify_caregiver_code_and_get_user_id(authorization, db)

    medications = (
        db.query(MedicationModel).filter(MedicationModel.user_id == user_id).all()
    )
    return medications


@router.get("/patient/glucose", response_model=List[GlucoseReading])
def get_patient_glucose_for_caregiver(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    user_id = verify_caregiver_code_and_get_user_id(authorization, db)

    glucose_readings = (
        db.query(GlucoseReadingModel)
        .filter(GlucoseReadingModel.user_id == user_id)
        .all()
    )
    return glucose_readings


@router.get("/patient/calendar", response_model=List[CalendarEvent])
def get_patient_calendar_for_caregiver(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    user_id = verify_caregiver_code_and_get_user_id(authorization, db)

    calendar_events = (
        db.query(CalendarEventModel).filter(CalendarEventModel.user_id == user_id).all()
    )
    return calendar_events


@router.get("/patient/pharmacy", response_model=List[PharmacyOrder])
def get_patient_pharmacy_for_caregiver(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    user_id = verify_caregiver_code_and_get_user_id(authorization, db)

    pharmacy_orders = (
        db.query(PharmacyOrderModel).filter(PharmacyOrderModel.user_id == user_id).all()
    )
    return pharmacy_orders


@router.get("/patient/profile")
def get_patient_profile_for_caregiver(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    user_id = verify_caregiver_code_and_get_user_id(authorization, db)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found"
        )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "age": user.age,
        "gender": user.gender,
        "weight": user.weight,
        "created_at": user.created_at,
    }


def verify_caregiver_code_and_get_user_id(
    authorization: Optional[str], db: Session
) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid caregiver code",
        )

    code_value = authorization.replace("Bearer ", "")

    code = (
        db.query(CaregiverCode)
        .filter(CaregiverCode.code == code_value, CaregiverCode.is_active == True)
        .first()
    )

    if code is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired caregiver code",
        )

    if code.expires_at and code.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Caregiver code has expired",
        )

    return code.user_id
