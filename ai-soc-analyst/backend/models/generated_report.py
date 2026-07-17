from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func

from db.base import Base


class GeneratedReport(Base):
    """
    An AI-generated incident report tied to a specific analysis.

    Created by the Report Generation Agent in Sprint 3+.
    In Sprint 1 we seed placeholder reports.
    """

    __tablename__ = "generated_reports"

    id                 = Column(Integer, primary_key=True, autoincrement=True)
    analysis_id        = Column(Integer, ForeignKey("analysis_results.id"), nullable=False)
    title              = Column(String(255), nullable=False)
    severity           = Column(String(20),  nullable=True)
    executive_summary  = Column(Text,        nullable=True)
    technical_details  = Column(Text,        nullable=True)
    remediation_steps  = Column(Text,        nullable=True)
    created_at         = Column(DateTime,    server_default=func.now())
