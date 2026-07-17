"""
Authentication & User Management Service.

Provides functions for user registration, authentication,
and user lookups by email or UUID.
"""

import logging
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.security import get_password_hash, verify_password
from backend.models.user import User
from backend.schemas.user import UserCreate

logger = logging.getLogger(__name__)


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """
    Register a new user.

    Checks if the email is already registered, hashes the password,
    creates the user record, and returns the persisted User object.

    Args:
        db: Async database session.
        user_data: Validated registration payload.

    Returns:
        The newly created User.

    Raises:
        ValueError: If a user with the given email already exists.
    """
    logger.info("Attempting to create user with email: %s", user_data.email)

    # ── Duplicate-email guard ──────────────────────────────────────────
    existing = await get_user_by_email(db, user_data.email)
    if existing:
        logger.warning("User with email %s already exists", user_data.email)
        raise ValueError(f"User with email {user_data.email} already exists")

    # ── Build and persist the user ─────────────────────────────────────
    hashed_pw = get_password_hash(user_data.password)

    new_user = User(
        id=str(uuid4()),
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_pw,
        is_active=True,
        role=getattr(user_data, "role", "analyst"),
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    logger.info("User created successfully: %s (id=%s)", new_user.email, new_user.id)
    return new_user


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> Optional[User]:
    """
    Authenticate a user by email and password.

    Args:
        db: Async database session.
        email: The user's email address.
        password: The plaintext password to verify.

    Returns:
        The authenticated User, or None if credentials are invalid.
    """
    logger.debug("Authenticating user: %s", email)

    user = await get_user_by_email(db, email)
    if user is None:
        logger.warning("Authentication failed — email not found: %s", email)
        return None

    if not verify_password(password, user.hashed_password):
        logger.warning("Authentication failed — invalid password for: %s", email)
        return None

    logger.info("User authenticated successfully: %s", email)
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Look up a user by their email address.

    Args:
        db: Async database session.
        email: Email to search for.

    Returns:
        The matching User, or None.
    """
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """
    Look up a user by their UUID primary key.

    Args:
        db: Async database session.
        user_id: UUID string of the user.

    Returns:
        The matching User, or None.
    """
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()
