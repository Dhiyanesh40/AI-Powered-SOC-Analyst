from sqlalchemy import Column, Integer, String, Text, DateTime, func

from db.base import Base


class AnalysisResult(Base):
    """
    Stores the result of one analysis session.

    Created when the user triggers POST /api/analyze.
    In Sprint 1 this is populated with placeholder data.
    In Sprint 2+ the ML model and multi-agent system fill it in.
    """

    __tablename__ = "analysis_results"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    filename          = Column(String(255), nullable=False)
    total_records     = Column(Integer,     nullable=False, default=0)
    threats_detected  = Column(Integer,     nullable=False, default=0)
    severity          = Column(String(20),  nullable=True)   # critical, high, medium, low
    attack_types      = Column(Text,        nullable=True)   # comma-separated list
    summary           = Column(Text,        nullable=True)   # human-readable summary
    created_at        = Column(DateTime,    server_default=func.now())
