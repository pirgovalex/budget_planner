from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import csv
import io
from ..database import get_db
from ..models import User, Transaction
from ..schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from ..auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    is_expense: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if category:
        query = query.filter(Transaction.category == category)
    if is_expense is not None:
        query = query.filter(Transaction.is_expense == is_expense)
    
    transactions = query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
    # Pydantic will handle the conversion from SQLAlchemy objects because from_attributes=True
    return transactions

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from ..llm_service import LLMService
    
    if not transaction.category:
        llm_service = LLMService()
        transaction.category = await llm_service.categorize_transaction(transaction.description)
    
    db_transaction = Transaction(
        user_id=current_user.id,
        **transaction.dict()
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    update_data = transaction.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_transaction)
    db.commit()
    return None

@router.post("/import")
async def import_transactions(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from ..llm_service import LLMService
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    contents = await file.read()
    csv_data = csv.DictReader(io.StringIO(contents.decode('utf-8')))
    
    llm_service = LLMService()
    imported_count = 0
    
    for row in csv_data:
        category = row.get('category') or await llm_service.categorize_transaction(row['description'])
        
        db_transaction = Transaction(
            user_id=current_user.id,
            date=datetime.fromisoformat(row['date']),
            amount=float(row['amount']),
            description=row['description'],
            category=category,
            is_expense=row.get('is_expense', 'true').lower() == 'true'
        )
        db.add(db_transaction)
        imported_count += 1
    
    db.commit()
    return {"message": f"Successfully imported {imported_count} transactions"}
