from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, PharmacyOrder
from app.schemas import PharmacyOrder as PharmacyOrderSchema, PharmacyOrderCreate, PharmacyOrderUpdate
from app.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[PharmacyOrderSchema])
def get_pharmacy_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(PharmacyOrder).filter(PharmacyOrder.user_id == current_user.id).order_by(PharmacyOrder.created_at.desc()).all()
    return orders

@router.post("/", response_model=PharmacyOrderSchema)
def create_pharmacy_order(
    order: PharmacyOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_order = PharmacyOrder(
        user_id=current_user.id,
        medication_name=order.medication_name,
        quantity=order.quantity,
        refill_type=order.refill_type,
        notes=order.notes
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/{order_id}", response_model=PharmacyOrderSchema)
def get_pharmacy_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(PharmacyOrder).filter(
        PharmacyOrder.id == order_id,
        PharmacyOrder.user_id == current_user.id
    ).first()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy order not found"
        )
    
    return order

@router.put("/{order_id}", response_model=PharmacyOrderSchema)
def update_pharmacy_order(
    order_id: int,
    order_update: PharmacyOrderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(PharmacyOrder).filter(
        PharmacyOrder.id == order_id,
        PharmacyOrder.user_id == current_user.id
    ).first()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy order not found"
        )
    
    # Update fields
    if order_update.status is not None:
        order.status = order_update.status
    if order_update.notes is not None:
        order.notes = order_update.notes
    
    db.commit()
    db.refresh(order)
    return order

@router.delete("/{order_id}")
def delete_pharmacy_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(PharmacyOrder).filter(
        PharmacyOrder.id == order_id,
        PharmacyOrder.user_id == current_user.id
    ).first()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy order not found"
        )
    
    db.delete(order)
    db.commit()
    
    return {"message": "Pharmacy order deleted successfully"} 