import logging
from typing import List
from datetime import datetime

from fastapi import APIRouter

from core.exceptions import NotFoundException
from schemas.schemas import ReportResponse

logger = logging.getLogger(__name__)
router = APIRouter()


# Placeholder data for Sprint 1
PLACEHOLDER_REPORTS = [
    ReportResponse(
        id=1,
        analysis_id=1,
        title="DDoS Hulk Attack — 192.168.10.5",
        severity="Critical",
        executive_summary="High-volume HTTP flood detected targeting port 80 from a single source IP.",
        technical_details="Observed 150,000+ packets/sec from 192.168.10.5 over a 2-minute window.",
        remediation_steps="Implement rate limiting and block source IP at the perimeter firewall.",
        created_at=datetime.utcnow(),
    ),
    ReportResponse(
        id=2,
        analysis_id=2,
        title="SSH Brute Force — 172.16.0.1",
        severity="High",
        executive_summary="Repeated authentication failures on port 22 indicating credential stuffing.",
        technical_details="Over 5,000 failed login attempts within 5 minutes against the root account.",
        remediation_steps="Enforce key-based authentication only. Disable password logins for SSH.",
        created_at=datetime.utcnow(),
    )
]


@router.get("/", response_model=List[ReportResponse])
async def get_reports():
    """
    Retrieve all incident reports.

    Sprint 1: Returns placeholder reports.
    Sprint 2: Will query the database for generated reports.
    """
    logger.info("Fetching reports.")
    return PLACEHOLDER_REPORTS


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report_by_id(report_id: int):
    """
    Retrieve a specific incident report by ID.
    """
    logger.info("Fetching report %d.", report_id)
    for report in PLACEHOLDER_REPORTS:
        if report.id == report_id:
            return report
    
    raise NotFoundException(detail=f"Report with ID {report_id} not found.")
