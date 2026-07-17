import logging
from datetime import datetime

from fastapi import APIRouter

from schemas.schemas import AnalysisResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=AnalysisResponse)
async def analyze_logs():
    """
    Trigger analysis on the most recently uploaded log file.

    Sprint 1: Returns placeholder analysis results.
    Sprint 2: Will trigger the ML pipeline and Agent Orchestrator.
    """
    logger.info("Analysis triggered.")

    return AnalysisResponse(
        id=1,
        filename="Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv",
        total_records=842912,
        threats_detected=318,
        severity="Critical",
        attack_types="DDoS",
        summary="High-volume HTTP flood detected targeting port 80 from a single source IP.",
        created_at=datetime.utcnow(),
    )
