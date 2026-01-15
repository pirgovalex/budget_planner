from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .config import settings
from .routers import auth, transactions, goals, analytics, ai

app = FastAPI(
    title="AI Budget Planner API",
    description="Intelligent budget planning system with LLM-powered insights",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(ai.router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {
        "message": "AI Budget Planner API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
