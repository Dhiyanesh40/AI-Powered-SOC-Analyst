from sqlalchemy import Column, Integer, String, Float, DateTime, func

from db.base import Base


class SecurityLog(Base):
    """
    Represents a single network flow record ingested from a CICIDS2017 CSV.

    Each row in the uploaded CSV becomes one SecurityLog entry.
    The ML model will populate the `prediction` and `confidence` fields
    in Sprint 2. Until then, they default to empty / zero.
    """

    __tablename__ = "security_logs"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    source_ip   = Column(String(45),  nullable=False)
    dest_ip     = Column(String(45),  nullable=False)
    source_port = Column(Integer,     nullable=False)
    dest_port   = Column(Integer,     nullable=False)
    protocol    = Column(String(10),  nullable=False, default="TCP")
    timestamp   = Column(String(30),  nullable=True)
    label       = Column(String(100), nullable=True)   # ground-truth label from dataset
    prediction  = Column(String(100), nullable=True)   # ML model output (Sprint 2)
    confidence  = Column(Float,       nullable=True, default=0.0)
    created_at  = Column(DateTime,    server_default=func.now())
