from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time


class UserBase(BaseModel):
    username: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str


class MedicationBase(BaseModel):
    name: str
    medication_type: str
    schedule: str

class MedicationCreate(MedicationBase):
    pass

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    medication_type: Optional[str] = None
    schedule: Optional[str] = None

class Medication(MedicationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GlucoseReadingBase(BaseModel):
    value: float

class GlucoseReadingCreate(GlucoseReadingBase):
    pass

class GlucoseReading(GlucoseReadingBase):
    id: int
    user_id: int
    reading_date: datetime

    class Config:
        from_attributes = True


class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: date
    event_time: Optional[time] = None
    reminder: bool = True

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[date] = None
    event_time: Optional[time] = None
    reminder: Optional[bool] = None

class CalendarEvent(CalendarEventBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CaregiverCodeBase(BaseModel):
    code: str

class CaregiverCodeCreate(CaregiverCodeBase):
    pass

class CaregiverCode(CaregiverCodeBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CaregiverNoteBase(BaseModel):
    note: str

class CaregiverNoteCreate(CaregiverNoteBase):
    pass

class CaregiverNote(CaregiverNoteBase):
    id: int
    user_id: int
    caregiver_code: str
    created_at: datetime

    class Config:
        from_attributes = True


class PharmacyOrderBase(BaseModel):
    medication_name: str
    quantity: int
    refill_type: str
    notes: Optional[str] = None

class PharmacyOrderCreate(PharmacyOrderBase):
    pass

class PharmacyOrderUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class PharmacyOrder(PharmacyOrderBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 