from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ReportBase(BaseModel):
    title: str
    executive_summary: str
    technical_details: str
    remediation_steps: str
    generated_by: str = "AI Agent System"

class ReportCreate(BaseModel):
    incident_id: UUID

class ReportResponse(ReportBase):
    id: UUID
    incident_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
