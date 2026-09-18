from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.postgres import init_db, async_session
from app.database.seed import seed_database
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.memories import router as memories_router
from app.api.conversations import router as conversations_router
from app.api.dashboard import router as dashboard_router
from app.api.search import router as search_router
from app.core.logging import MemoryLogger

@asynccontextmanager
async def lifespan(app: FastAPI):
    MemoryLogger.store("Initializing MEMORA Episodic Memory Engine...")
    await init_db()
    async with async_session() as db:
        await seed_database(db)
    MemoryLogger.store("MEMORA FastAPI server is online and ready.")
    yield
    MemoryLogger.store("Shutting down MEMORA server.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-Ready Episodic Long-Term Memory AI Chatbot Backend",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(memories_router, prefix=settings.API_V1_STR)
app.include_router(conversations_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "app": "MEMORA",
        "description": "An AI that remembers, learns and evolves.",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "memora-backend"}
