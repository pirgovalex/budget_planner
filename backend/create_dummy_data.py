import sys
import os
sys.path.append(os.getcwd())

from backend.database import SessionLocal
from backend.models import User, Transaction, Goal
from backend.auth import get_password_hash
from datetime import datetime, timedelta, timezone

def create_dummy_data():
    db = SessionLocal()
    
    # Create 10 Users
    users = []
    print("Creating 10 dummy users...")
    for i in range(1, 11):
        username = f"test_user_{i}"
        password = f"password{123+i}"
        email = f"user{i}@example.com"
        
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            user = existing
        else:
            hashed_pw = get_password_hash(password)
            user = User(username=username, email=email, hashed_password=hashed_pw)
            db.add(user)
            db.commit()
            db.refresh(user)
        
        users.append((user, username, password))
        print(f"Credentials -> Username: {username} | Password: {password}")

    # Add Transactions and Goals for each user
    print("Adding mock transactions and goals for all users...")
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

    for user, uname, pw in users:
        for t in transactions:
            date = datetime.now(timezone.utc) - timedelta(days=t["days_ago"])
            exists = db.query(Transaction).filter(
                Transaction.user_id == user.id, 
                Transaction.description == t["desc"],
                Transaction.amount == t["amount"]
            ).first()
            
            if not exists:
                new_tx = Transaction(
                    user_id=user.id,
                    amount=t["amount"] + (user.id * 10), # Slight variance per user
                    description=t["desc"],
                    category=t["cat"],
                    is_expense=t["expense"],
                    date=date
                )
                db.add(new_tx)

        goal_exists = db.query(Goal).filter(Goal.user_id == user.id, Goal.name == "Лятна почивка").first()
        if not goal_exists:
            goal = Goal(
                user_id=user.id,
                name="Лятна почивка",
                target_amount=1500.00,
                current_amount=450.00 + (user.id * 50),
                deadline=datetime.now(timezone.utc) + timedelta(days=90)
            )
            db.add(goal)

    db.commit()
    print("Done! Dummy data created for 10 users.")

if __name__ == "__main__":
    create_dummy_data()
