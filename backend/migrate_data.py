import sys
import os
import csv
import json
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal, init_db
from backend.models import User, Transaction, Goal
from backend.auth import get_password_hash

def migrate_data():
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    
    try:
        existing_user = db.query(User).filter(User.username == "demo").first()
        if existing_user:
            print("Demo user already exists")
            user = existing_user
        else:
            print("Creating demo user...")
            user = User(
                username="demo",
                email="demo@example.com",
                hashed_password=get_password_hash("demo123")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created user: {user.username}")
        
        csv_path = "transactions.csv"
        if os.path.exists(csv_path):
            print(f"\nMigrating transactions from {csv_path}...")
            with open(csv_path, 'r') as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    transaction = Transaction(
                        user_id=user.id,
                        date=datetime.fromisoformat(row['date']),
                        amount=float(row['amount']),
                        description=row['description'],
                        category=row.get('category'),
                        is_expense=row.get('is_expense', 'true').lower() == 'true'
                    )
                    db.add(transaction)
                    count += 1
                db.commit()
                print(f"Migrated {count} transactions")
        else:
            print(f"No {csv_path} found, skipping transaction migration")
        
        goals_path = "goals.json"
        if os.path.exists(goals_path):
            print(f"\nMigrating goals from {goals_path}...")
            with open(goals_path, 'r') as f:
                goals_data = json.load(f)
                count = 0
                for goal_data in goals_data:
                    deadline = None
                    if goal_data.get('deadline'):
                        try:
                            deadline = datetime.fromisoformat(goal_data['deadline'])
                        except:
                            pass
                    
                    goal = Goal(
                        user_id=user.id,
                        name=goal_data['name'],
                        target_amount=goal_data['target_amount'],
                        current_amount=goal_data.get('current_amount', 0.0),
                        deadline=deadline
                    )
                    db.add(goal)
                    count += 1
                db.commit()
                print(f"Migrated {count} goals")
        else:
            print(f"No {goals_path} found, skipping goals migration")
        
        print("\nMigration completed successfully!")
        print(f"\nDemo credentials:")
        print(f"Username: demo")
        print(f"Password: demo123")
        
        # Also ensure test_user exists (as per README)
        print("\nEnsuring test_user exists...")
        from backend.create_dummy_data import create_dummy_data
        create_dummy_data()
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_data()
