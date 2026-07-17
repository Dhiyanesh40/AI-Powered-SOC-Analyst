from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class LogEntryBase(BaseModel):
    source_ip: str
    dest_ip: str
    source_port: int
    dest_port: int
    protocol: str
    flow_duration: float
    total_fwd_packets: int
    total_bwd_packets: int
    label: str
    prediction: str
    confidence: float

class LogEntryResponse(LogEntryBase):
    id: UUID
    upload_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class LogUploadResponse(BaseModel):
    upload_id: str
    total_processed: int
    anomalies_detected: int
    alerts_created: List[UUID]
    status: str
