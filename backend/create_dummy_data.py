import sys
import os
sys.path.append(os.getcwd())

from backend.database import SessionLocal
from backend.models import User, Transaction, Goal
from backend.auth import get_password_hash
from datetime import datetime, timedelta

def create_dummy_data():
    db = SessionLocal()
    
    # 1. Create User
    username = "test_user"
    password = "password123"
    
    # Check if exists
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print(f"User {username} already exists. Skipping creation.")
        user = existing
    else:
        print(f"Creating user {username}...")
        hashed_pw = get_password_hash(password)
        user = User(username=username, email="test@example.com", hashed_password=hashed_pw)
        db.add(user)
        db.commit()
        db.refresh(user)

    # 2. Add Transactions (Mock Data)
    print("Adding mock transactions...")
    transactions = [
        {"desc": "Заплата", "amount": 2500.00, "cat": "Income", "expense": False, "days_ago": 2},
        {"desc": "Наем за апартамента", "amount": 800.00, "cat": "Bills", "expense": True, "days_ago": 3},
        {"desc": "Супермаркет покупки", "amount": 125.50, "cat": "Food", "expense": True, "days_ago": 5},
        {"desc": "Netflix абонамент", "amount": 15.99, "cat": "Entertainment", "expense": True, "days_ago": 10},
        {"desc": "Вечеря с приятели", "amount": 65.00, "cat": "Food", "expense": True, "days_ago": 12},
        {"desc": "Бензин Shell", "amount": 50.00, "cat": "Transport", "expense": True, "days_ago": 15},
        {"desc": "Фитнес карта", "amount": 40.00, "cat": "Health", "expense": True, "days_ago": 25},
        {"desc": "Нови обувки", "amount": 120.00, "cat": "Shopping", "expense": True, "days_ago": 28},
    ]

    for t in transactions:
        date = datetime.utcnow() - timedelta(days=t["days_ago"])
        # Check if transaction exists to avoid dupes on re-run
        exists = db.query(Transaction).filter(
            Transaction.user_id == user.id, 
            Transaction.description == t["desc"],
            Transaction.amount == t["amount"]
        ).first()
        
        if not exists:
            new_tx = Transaction(
                user_id=user.id,
                amount=t["amount"],
                description=t["desc"],
                category=t["cat"],
                is_expense=t["expense"],
                date=date
            )
            db.add(new_tx)

    # 3. Add Goal
    print("Adding mock goal...")
    goal_exists = db.query(Goal).filter(Goal.user_id == user.id, Goal.name == "Лятна почивка").first()
    if not goal_exists:
        goal = Goal(
            user_id=user.id,
            name="Лятна почивка",
            target_amount=1500.00,
            current_amount=450.00,
            deadline=datetime.utcnow() + timedelta(days=90)
        )
        db.add(goal)

    db.commit()
    print("Done! Dummy data created.")
    print(f"Credentials -> Username: {username} | Password: {password}")

if __name__ == "__main__":
    create_dummy_data()
