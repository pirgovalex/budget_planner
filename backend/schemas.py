from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class TransactionCreate(BaseModel):
    date: datetime
    amount: float = Field(..., gt=0)
    description: str = Field(..., min_length=1, max_length=255)
    category: Optional[str] = None
    is_expense: bool = True

class TransactionUpdate(BaseModel):
    date: Optional[datetime] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=1, max_length=255)
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
    
    model_config = ConfigDict(from_attributes=True)

class GoalCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(0.0, ge=0)
    deadline: Optional[datetime] = None

class GoalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    target_amount: Optional[float] = Field(None, gt=0)
    current_amount: Optional[float] = Field(None, ge=0)
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
    
    model_config = ConfigDict(from_attributes=True)

class AnalyticsSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_savings: float
    spending_by_category: dict[str, float]
    monthly_summary: dict[str, dict[str, float]]
