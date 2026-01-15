from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class TransactionCreate(BaseModel):
    date: datetime
    amount: float
    description: str
    category: Optional[str] = None
    is_expense: bool = True

class TransactionUpdate(BaseModel):
    date: Optional[datetime] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_expense: Optional[bool] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    amount: float
    description: str
    category: Optional[str]
    is_expense: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[datetime] = None

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[datetime] = None

class GoalResponse(BaseModel):
    id: int
    user_id: int
    name: str
    target_amount: float
    current_amount: float
    deadline: Optional[datetime]
    created_at: datetime
    progress: float
    remaining: float
    
    class Config:
        from_attributes = True

class AnalyticsSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    spending_by_category: dict[str, float]
    monthly_summary: dict[str, dict[str, float]]
