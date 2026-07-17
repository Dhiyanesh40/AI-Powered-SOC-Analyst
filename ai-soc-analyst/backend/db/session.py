from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.config import settings

"""
Database engine and session factory.

Uses SQLite during development (from DATABASE_URL in .env).
In production, swap to a PostgreSQL connection string.

The `connect_args` check ensures SQLite's single-threaded lock
is relaxed for FastAPI's concurrent request handling.
"""

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """
    FastAPI dependency that provides a database session per request.

    Usage:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
