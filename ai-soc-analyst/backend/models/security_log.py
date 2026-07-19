from sqlalchemy import Column, Integer, String, Float, DateTime, Text, func

from db.base import Base


class SecurityLog(Base):
    """
    Audit Log for the AI SOC Analyst application.
    
    Each record represents one event in the analysis pipeline.
    Reused from Sprint 1 network flow storage as per requirements.
    """

    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id = Column(Integer, nullable=True)
    dataset_filename = Column(String(255), nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    event_type = Column(String(100), nullable=False)
    current_stage = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)
    duration = Column(Float, nullable=True)
    details = Column(Text, nullable=True)
