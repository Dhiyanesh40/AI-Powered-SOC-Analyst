from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from backend.schemas.alert import AlertResponse

class IncidentBase(BaseModel):
    title: str
    description: str
    severity: str
    status: str = "open"
    assigned_to: Optional[str] = None

class IncidentCreate(BaseModel):
    alert_id: UUID

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    investigation_notes: Optional[str] = None
    mitigation_steps: Optional[str] = None
    assigned_to: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: UUID
    alert_id: UUID
    alert: AlertResponse
    investigation_notes: Optional[str] = None
    mitigation_steps: Optional[str] = None
    agent_reasoning: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
