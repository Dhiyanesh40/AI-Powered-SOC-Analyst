from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, JSON
from backend.db.base import Base

class Alert(Base):
    __tablename__ = "alerts"
    
    source_ip: Mapped[str] = mapped_column(String(45), index=True)
    dest_ip: Mapped[str] = mapped_column(String(45), index=True)
    source_port: Mapped[int] = mapped_column(Integer)
    dest_port: Mapped[int] = mapped_column(Integer)
    protocol: Mapped[str] = mapped_column(String(10))
    attack_type: Mapped[str] = mapped_column(String(100), index=True)
    severity: Mapped[str] = mapped_column(String(20), index=True) # critical, high, medium, low, info
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    status: Mapped[str] = mapped_column(String(30), default="open") # open, investigating, resolved, false_positive
    raw_features: Mapped[dict] = mapped_column(JSON, nullable=True) # stores the flow record features
