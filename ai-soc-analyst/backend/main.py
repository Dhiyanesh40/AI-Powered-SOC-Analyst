import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.logging import setup_logging
from core.exceptions import (
    AppException,
    app_exception_handler,
    generic_exception_handler,
)
from api.router import router as api_router
from db.session import engine
from db.base import Base
import models

# ── Logging ──
setup_logging()
logger = logging.getLogger(__name__)

# ── App ──
app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception Handlers ──
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ── Routes ──
app.include_router(api_router, prefix="/api")


# ── Startup Event ──
@app.on_event("startup")
def on_startup():
    """Create database tables if they don't exist (SQLite dev mode)."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")
    logger.info("%s backend started successfully.", settings.APP_NAME)


# ── Health Check ──
@app.get("/", tags=["Health"])
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}
