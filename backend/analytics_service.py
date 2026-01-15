from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict, OrderedDict
from .models import Transaction

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_spending_by_category(self, user_id: int, days: int = 30) -> dict:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        transactions = self.db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.is_expense == True
        ).all()
        
        category_totals = defaultdict(float)
        for t in transactions:
            category = t.category or "Uncategorized"
            category_totals[category] += t.amount
            
        return dict(category_totals)
    
    def get_monthly_summary(self, user_id: int) -> dict:
        # Get data for last 6 months
        start_date = datetime.utcnow() - timedelta(days=180)
        
        transactions = self.db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date
        ).all()
        
        summary = OrderedDict()
        
        # Initialize last 6 months
        for i in range(5, -1, -1):
            date = datetime.utcnow() - timedelta(days=i*30)
            month_key = date.strftime('%Y-%m')
            summary[month_key] = {"income": 0.0, "expenses": 0.0, "net": 0.0}
            
        for t in transactions:
            month_key = t.date.strftime('%Y-%m')
            if month_key in summary:
                if t.is_expense:
                    summary[month_key]["expenses"] += t.amount
                    summary[month_key]["net"] -= t.amount
                else:
                    summary[month_key]["income"] += t.amount
                    summary[month_key]["net"] += t.amount
                    
        return summary
    
    def get_predictions(self, user_id: int) -> dict:
        # Simple average prediction without pandas/scikit-learn
        start_date = datetime.utcnow() - timedelta(days=90)
        
        transactions = self.db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.is_expense == True
        ).all()
        
        total_expenses = sum(t.amount for t in transactions)
        months = 3
        average_monthly = total_expenses / months
        
        return {
            "predicted_expenses": round(average_monthly, 2),
            "average_last_3_months": round(average_monthly, 2),
            "trend": "stable"
        }
    
    def get_financial_summary(self, user_id: int) -> dict:
        transactions = self.db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).all()
        
        total_income = sum(t.amount for t in transactions if not t.is_expense)
        total_expenses = sum(t.amount for t in transactions if t.is_expense)
        
        return {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_savings": total_income - total_expenses
        }
