from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict
from ..database import get_db
from ..models import User
from ..auth import get_current_user
from ..llm_service import LLMService
from ..analytics_service import AnalyticsService

router = APIRouter(prefix="/ai", tags=["AI Insights"])

def get_llm_service():
    return LLMService()

def get_analytics_service(db: Session = Depends(get_db)):
    return AnalyticsService(db)

@router.get("/insights")
def get_ai_insights(
    current_user: User = Depends(get_current_user),
    llm_service: LLMService = Depends(get_llm_service),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> dict:
    
    totals = analytics_service.get_financial_summary(current_user.id)
    spending_by_category = analytics_service.get_spending_by_category(current_user.id)
    
    transactions_data = {
        'total_expenses': totals['total_expenses'],
        'spending_by_category': spending_by_category
    }
    
    analysis = llm_service.get_budget_recommendations(transactions_data)
    
    return {
        "insights": analysis,
        "total_expenses": totals['total_expenses'],
        "total_income": totals['total_income'],
        "net_savings": totals['net_savings']
    }

@router.get("/savings-recommendations")
def get_savings_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    llm_service: LLMService = Depends(get_llm_service),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
) -> Dict[str, str]:
    from ..models import Goal
    
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    
    totals = analytics_service.get_financial_summary(current_user.id)
    current_savings = totals['net_savings']
    
    recommendations = llm_service.suggest_savings_plan(goals, current_savings)
    
    return {"recommendations": recommendations}
