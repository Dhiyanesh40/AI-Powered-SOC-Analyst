from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float
from backend.db.base import Base

class LogEntry(Base):
    __tablename__ = "log_entries"
    
    upload_id: Mapped[str] = mapped_column(String(100), index=True)
    source_ip: Mapped[str] = mapped_column(String(45))
    dest_ip: Mapped[str] = mapped_column(String(45))
    source_port: Mapped[int] = mapped_column(Integer)
    dest_port: Mapped[int] = mapped_column(Integer)
    protocol: Mapped[str] = mapped_column(String(10))
    flow_duration: Mapped[float] = mapped_column(Float)
    total_fwd_packets: Mapped[int] = mapped_column(Integer)
    total_bwd_packets: Mapped[int] = mapped_column(Integer)
    label: Mapped[str] = mapped_column(String(100)) # Ground truth label (from dataset if available)
    prediction: Mapped[str] = mapped_column(String(100)) # Model prediction (e.g. BENIGN or Bot)
    confidence: Mapped[float] = mapped_column(Float)
