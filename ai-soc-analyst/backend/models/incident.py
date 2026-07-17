from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from backend.db.base import Base
from datetime import datetime
import uuid

class Incident(Base):
    __tablename__ = "incidents"
    
    alert_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(1000))
    severity: Mapped[str] = mapped_column(String(20)) # critical, high, medium, low
    status: Mapped[str] = mapped_column(String(30), default="open") # open, investigating, mitigated, closed
    investigation_notes: Mapped[str] = mapped_column(String, nullable=True)
    mitigation_steps: Mapped[str] = mapped_column(String, nullable=True)
    agent_reasoning: Mapped[str] = mapped_column(String, nullable=True)
    assigned_to: Mapped[str] = mapped_column(String(255), nullable=True)
    resolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    alert = relationship("Alert")
