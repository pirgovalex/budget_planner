from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import AnalyticsSummary
from ..auth import get_current_user
from ..analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_analytics_service(db: Session = Depends(get_db)):
    return AnalyticsService(db)

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    totals = service.get_financial_summary(current_user.id)
    spending_by_category = service.get_spending_by_category(current_user.id)
    monthly_summary = service.get_monthly_summary(current_user.id)
    
    return AnalyticsSummary(
        total_income=totals['total_income'],
        total_expenses=totals['total_expenses'],
        net_savings=totals['net_savings'],
        spending_by_category=spending_by_category,
        monthly_summary=monthly_summary
    )

@router.get("/spending-by-category")
def get_spending_by_category(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    return service.get_spending_by_category(current_user.id, days)

@router.get("/monthly-summary")
def get_monthly_summary(
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    return service.get_monthly_summary(current_user.id)

@router.get("/predictions")
def get_predictions(
    current_user: User = Depends(get_current_user),
    service: AnalyticsService = Depends(get_analytics_service)
):
    return service.get_predictions(current_user.id)
