from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    weight = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    medications = relationship("Medication", back_populates="user", cascade="all, delete-orphan")
    glucose_readings = relationship("GlucoseReading", back_populates="user", cascade="all, delete-orphan")
    calendar_events = relationship("CalendarEvent", back_populates="user", cascade="all, delete-orphan")
    caregiver_codes = relationship("CaregiverCode", back_populates="user", cascade="all, delete-orphan")
    pharmacy_orders = relationship("PharmacyOrder", back_populates="user", cascade="all, delete-orphan")

class Medication(Base):
    __tablename__ = "medications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    medication_type = Column(String, nullable=False)
    schedule = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    
    user = relationship("User", back_populates="medications")

class GlucoseReading(Base):
    __tablename__ = "glucose_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    value = Column(Float, nullable=False)
    reading_date = Column(DateTime(timezone=True), server_default=func.now())
    
    
    user = relationship("User", back_populates="glucose_readings")

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    event_date = Column(Date, nullable=False)
    event_time = Column(Time)
    reminder = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    
    user = relationship("User", back_populates="calendar_events")

class CaregiverCode(Base):
    __tablename__ = "caregiver_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    
    
    user = relationship("User", back_populates="caregiver_codes")

class CaregiverNote(Base):
    __tablename__ = "caregiver_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    caregiver_code = Column(String, nullable=False)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    
    user = relationship("User")

class PharmacyOrder(Base):
    __tablename__ = "pharmacy_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    medication_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    refill_type = Column(String, nullable=False)  # "select" or "manual"
    status = Column(String, default="pending")  # "pending", "completed", "cancelled"
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    
    user = relationship("User", back_populates="pharmacy_orders") 