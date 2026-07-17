from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean
from backend.db.base import Base

class User(Base):
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="analyst") # admin, analyst, supervisor
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
