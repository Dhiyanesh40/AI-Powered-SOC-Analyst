from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ── Request Schemas ──

# (No request body needed for upload in Sprint 1 — the file is the body.)


# ── Response Schemas ──

class UploadResponse(BaseModel):
    """Returned after a CSV file is uploaded."""

    filename: str
    total_records: int
    num_columns: int
    columns: list[str]
    preview: list[dict]
    status: str


class AnalysisResponse(BaseModel):
    """Returned after triggering analysis."""

    id: int
    filename: str
    total_records: int
    threats_detected: int
    severity: Optional[str] = None
    attack_types: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    """Returned when fetching a report."""

    id: int
    analysis_id: int
    title: str
    severity: Optional[str] = None
    executive_summary: Optional[str] = None
    technical_details: Optional[str] = None
    remediation_steps: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryEntry(BaseModel):
    """A single item in the activity history feed."""

    id: int
    action: str
    detail: str
    timestamp: str
