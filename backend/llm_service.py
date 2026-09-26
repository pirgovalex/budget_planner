from datetime import datetime
from typing import List, Optional
import random
from huggingface_hub import InferenceClient
from .config import settings
from .models import Transaction, Goal

class LLMService:
    def __init__(self):
        token = settings.HF_TOKEN if settings.HF_TOKEN else None
        self.client = InferenceClient(token=token) if token else None
        self.model = "meta-llama/Llama-3.2-3B-Instruct"

    def _query_llm(self, prompt: str) -> str:
        if not self.client:
            raise Exception("No Client")
        
        response = self.client.text_generation(
            prompt,
            model=self.model,
            max_new_tokens=500,
            temperature=0.7
        )
        return response

    def categorize_transaction(self, description: str) -> str:
        valid_categories = ['Income', 'Bills', 'Food', 'Entertainment', 'Transport', 'Health', 'Shopping', 'Other']

        if not self.client:
            desc_lower = description.lower()
            if any(x in desc_lower for x in ['uber', 'bus', 'train', 'gas', 'fuel']): return 'Transport'
            if any(x in desc_lower for x in ['food', 'burger', 'pizza', 'grocery', 'market']): return 'Food'
            if any(x in desc_lower for x in ['netflix', 'spotify', 'cinema', 'game']): return 'Entertainment'
            if any(x in desc_lower for x in ['salary', 'deposit']): return 'Income'
            if any(x in desc_lower for x in ['pharmacy', 'doctor', 'med']): return 'Health'
            return "Other"
            
        prompt = f"""
        Categorize this transaction description into exactly one of these categories:
        {', '.join(valid_categories)}
        
        Description: "{description}"
        
        Return ONLY the category name.
        """
        
        try:
            category_response = self._query_llm(prompt).strip()
            
            # Direct match
            for cat in valid_categories:
                if cat.lower() == category_response.lower():
                    return cat
            
            # Substring match (in case of conversational response)
            for cat in valid_categories:
                if cat.lower() in category_response.lower():
                    return cat
                    
            return "Other"
        except:
            return "Other"

    def get_budget_recommendations(self, spending_data: dict) -> str:
        try:
            if not self.client: raise Exception("Mock Mode")
            
            total_expenses = spending_data.get('total_expenses', 0)
            categories = spending_data.get('spending_by_category', {})
            
            if not categories:
                return "Not enough data to provide recommendations."
            
            top_category = max(categories, key=categories.get) if categories else "None"
            
            prompt = f"""You are a helpful financial advisor. Analyze this spending summary and give brief, practical advice (2-3 sentences max).

Total spent: ${total_expenses:.2f}
Spending by category: {categories}
Top spending category: {top_category}

Give specific actionable advice:"""

            return self._query_llm(prompt)
            
        except Exception as e:
            top_cat = "Food"
            if 'spending_by_category' in spending_data and spending_data['spending_by_category']:
                top_cat = max(spending_data['spending_by_category'], key=spending_data['spending_by_category'].get)
            
            return f"""(Simulated AI) Based on your activity:
• You're spending a significant amount on {top_cat}. Consider setting a stricter budget here.
• Track your daily small expenses, as they add up quickly.
• Good job maintaining a diverse spending portfolio!"""

    def suggest_savings_plan(self, goals: List[Goal], current_savings: float) -> str:
        try:
            if not self.client: raise Exception("Mock Mode")

            if not goals:
                return "You have no defined financial goals. Set some goals to get recommendations."
            
            goals_text = "\n".join([f"- {g.name}: ${g.current_amount}/{g.target_amount}" for g in goals])
            
            prompt = f"""You are a financial advisor. Give brief, practical savings tips for these goals (1-2 sentences per goal).

Financial Goals:
{goals_text}

Current available savings: ${current_savings:.2f}

Provide specific savings tips:"""

            return self._query_llm(prompt)
            
        except Exception:
            if not goals: return "Set some goals to get started!"
            goal_name = goals[0].name
            return f"""(Simulated AI) Savings Recommendations:
• For '{goal_name}', try setting aside $50 every week to hit your target faster.
• Review subscription services you rarely use to redirect funds to savings.
• Consider a high-yield savings account for your emergency fund."""
