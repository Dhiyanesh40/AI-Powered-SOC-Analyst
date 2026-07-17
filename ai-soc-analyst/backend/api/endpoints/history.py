import logging
from typing import List

from fastapi import APIRouter

from schemas.schemas import HistoryEntry

logger = logging.getLogger(__name__)
router = APIRouter()


# Placeholder data for Sprint 1
PLACEHOLDER_HISTORY = [
    HistoryEntry(
        id=1,
        action="CSV Uploaded",
        detail="Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv",
        timestamp="2026-07-16 16:21:40",
    ),
    HistoryEntry(
        id=2,
        action="ML Analysis Completed",
        detail="318 anomalies detected out of 842,912 flow records.",
        timestamp="2026-07-16 16:22:05",
    ),
    HistoryEntry(
        id=3,
        action="Agent Investigation Started",
        detail="Orchestrator dispatched Log Analysis Agent for Alert #47.",
        timestamp="2026-07-16 16:22:12",
    ),
    HistoryEntry(
        id=4,
        action="Report Generated",
        detail="Incident report created for DDoS Hulk attack on 192.168.10.5.",
        timestamp="2026-07-16 16:23:30",
    ),
]


@router.get("/", response_model=List[HistoryEntry])
async def get_history():
    """
    Retrieve the chronological log of system activity.

    Sprint 1: Returns placeholder history.
    Sprint 2: Will query the database for activity logs.
    """
    logger.info("Fetching history.")
    return PLACEHOLDER_HISTORY
