from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any

class AlertBase(BaseModel):
    source_ip: str
    dest_ip: str
    source_port: int
    dest_port: int
    protocol: str
    attack_type: str
    severity: str
    confidence: float
    status: str = "open"

class AlertCreate(AlertBase):
    raw_features: Optional[Dict[str, Any]] = None

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None

class AlertResponse(AlertBase):
    id: UUID
    raw_features: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AlertListResponse(BaseModel):
    items: List[AlertResponse]
    total: int
    page: int
    size: int
