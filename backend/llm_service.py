from datetime import datetime
from typing import List, Optional
import asyncio
import random
from concurrent.futures import ThreadPoolExecutor
from huggingface_hub import InferenceClient
from .config import settings
from .models import Transaction, Goal

class LLMService:
    def __init__(self):
        token = settings.HF_TOKEN if settings.HF_TOKEN else None
        self.client = InferenceClient(token=token) if token else None
        self.model = "meta-llama/Llama-3.2-3B-Instruct"

    async def _query_llm(self, prompt: str) -> str:
        # Check if we have a client; if not, return mock data immediately (handled by caller fallback usually, 
        # but here we can't generic mock easily without context, so we'll handle mocks in specific methods).
        # However, if we are here, we expect real generation.
        if not self.client:
            raise Exception("No Client")
        
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as pool:
            response = await loop.run_in_executor(
                pool,
                lambda: self.client.text_generation(
                    prompt,
                    model=self.model,
                    max_new_tokens=500,
                    temperature=0.7
                )
            )
        return response

    async def categorize_transaction(self, description: str) -> str:
        if not self.client:
            # Simple keyword matching mock
            desc_lower = description.lower()
            if any(x in desc_lower for x in ['uber', 'bus', 'train', 'gas', 'fuel']): return 'Transport'
            if any(x in desc_lower for x in ['food', 'burger', 'pizza', 'grocery', 'market']): return 'Food'
            if any(x in desc_lower for x in ['netflix', 'spotify', 'cinema', 'game']): return 'Entertainment'
            if any(x in desc_lower for x in ['salary', 'deposit']): return 'Income'
            if any(x in desc_lower for x in ['pharmacy', 'doctor', 'med']): return 'Health'
            return "Miscellaneous"
            
        prompt = f"""
        Categorize this transaction description into exactly one of these categories:
        Food, Transport, Utilities, Entertainment, Shopping, Health, Travel, Income, Miscellaneous
        
        Description: "{description}"
        
        Return ONLY the category name.
        """
        
        try:
            category = await self._query_llm(prompt)
            return category.strip().split('\n')[0]
        except:
            return "Miscellaneous"

    async def get_budget_recommendations(self, spending_data: dict) -> str:
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

            return await self._query_llm(prompt)
            
        except Exception as e:
            # Mock Response
            top_cat = "Food"
            if 'spending_by_category' in spending_data and spending_data['spending_by_category']:
                top_cat = max(spending_data['spending_by_category'], key=spending_data['spending_by_category'].get)
            
            return f"""(Simulated AI) Based on your activity:
• You're spending a significant amount on {top_cat}. Consider setting a stricter budget here.
• Track your daily small expenses, as they add up quickly.
• Good job maintaining a diverse spending portfolio!"""

    async def suggest_savings_plan(self, goals: List[Goal], current_savings: float) -> str:
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

            return await self._query_llm(prompt)
            
        except Exception:
            # Mock Response
            if not goals: return "Set some goals to get started!"
            goal_name = goals[0].name
            return f"""(Simulated AI) Savings Recommendations:
• For '{goal_name}', try setting aside $50 every week to hit your target faster.
• Review subscription services you rarely use to redirect funds to savings.
• Consider a high-yield savings account for your emergency fund."""
