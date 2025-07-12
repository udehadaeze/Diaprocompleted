from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, CalendarEvent
from app.schemas import CalendarEvent as CalendarEventSchema, CalendarEventCreate, CalendarEventUpdate
from app.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CalendarEventSchema])
def get_calendar_events(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id).order_by(CalendarEvent.event_date).all()
    return events

@router.post("/", response_model=CalendarEventSchema)
def create_calendar_event(
    event: CalendarEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_event = CalendarEvent(
        user_id=current_user.id,
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        event_time=event.event_time,
        reminder=event.reminder
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/{event_id}", response_model=CalendarEventSchema)
def get_calendar_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(CalendarEvent).filter(
        CalendarEvent.id == event_id,
        CalendarEvent.user_id == current_user.id
    ).first()
    
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found"
        )
    
    return event

@router.put("/{event_id}", response_model=CalendarEventSchema)
def update_calendar_event(
    event_id: int,
    event_update: CalendarEventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(CalendarEvent).filter(
        CalendarEvent.id == event_id,
        CalendarEvent.user_id == current_user.id
    ).first()
    
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found"
        )
    
    # Update fields
    if event_update.title is not None:
        event.title = event_update.title
    if event_update.description is not None:
        event.description = event_update.description
    if event_update.event_date is not None:
        event.event_date = event_update.event_date
    if event_update.event_time is not None:
        event.event_time = event_update.event_time
    if event_update.reminder is not None:
        event.reminder = event_update.reminder
    
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}")
def delete_calendar_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(CalendarEvent).filter(
        CalendarEvent.id == event_id,
        CalendarEvent.user_id == current_user.id
    ).first()
    
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found"
        )
    
    db.delete(event)
    db.commit()
    
    return {"message": "Calendar event deleted successfully"} 