"""
Analyze endpoint — Runs the ML prediction pipeline on an uploaded CSV.

Sprint 3: Real ML analysis replaces the Sprint 1 placeholder.
"""

import logging
import json
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from db.session import get_db
from models.analysis_result import AnalysisResult

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR = Path("uploads")


class AnalyzeRequest(BaseModel):
    """Request body for triggering analysis."""
    filename: str


class AnalysisResultResponse(BaseModel):
    """SOC analysis summary returned to the frontend."""
    id: int
    filename: str
    total_records: int
    threats_detected: int
    severity: Optional[str] = None
    attack_types: Optional[str] = None
    summary: Optional[str] = None
    attack_distribution: Optional[dict] = None
    most_common_attack: Optional[str] = None
    average_confidence: Optional[float] = None
    highest_confidence: Optional[float] = None
    threat_level: Optional[str] = None
    analysis_duration: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=AnalysisResultResponse)
async def analyze_logs(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
):
    """
    Trigger ML analysis on a previously uploaded CSV file.

    Expects `{ "filename": "<uploaded_filename>" }` in the request body.
    """
    filepath = UPLOAD_DIR / request.filename

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Uploaded file not found. Please upload again.")

    logger.info("Analysis triggered for: %s", request.filename)

    # ── Run the ML prediction pipeline ──
    try:
        from ml.predict import predict_dataset
        summary = predict_dataset(str(filepath))
    except RuntimeError as e:
        logger.error("ML model error: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Analysis failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    # ── Determine severity from threat level ──
    severity = summary.get("threat_level", "Low")

    # ── Build attack types string ──
    attack_dist = summary.get("attack_distribution", {})
    attack_types_str = ", ".join(
        f"{k} ({v})" for k, v in sorted(attack_dist.items(), key=lambda x: -x[1])
    )

    # ── Build human-readable summary ──
    readable_summary = (
        f"Analyzed {summary['total_records']} records in {summary['analysis_duration']}s. "
        f"Detected {summary['threats_detected']} threats. "
        f"Most common attack: {summary['most_common_attack']}. "
        f"Average confidence: {summary['average_confidence']:.2%}. "
        f"Threat level: {severity}."
    )

    # ── Save to database ──
    # Find existing AnalysisResult for this filename (created during upload) and update it
    existing = db.query(AnalysisResult).filter(
        AnalysisResult.filename == request.filename
    ).first()

    if existing:
        existing.total_records = summary["total_records"]
        existing.threats_detected = summary["threats_detected"]
        existing.severity = severity
        existing.attack_types = attack_types_str
        existing.summary = readable_summary
        db.commit()
        db.refresh(existing)
        record = existing
    else:
        record = AnalysisResult(
            filename=request.filename,
            total_records=summary["total_records"],
            threats_detected=summary["threats_detected"],
            severity=severity,
            attack_types=attack_types_str,
            summary=readable_summary,
            created_at=datetime.utcnow(),
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    return AnalysisResultResponse(
        id=record.id,
        filename=record.filename,
        total_records=record.total_records,
        threats_detected=record.threats_detected,
        severity=record.severity,
        attack_types=record.attack_types,
        summary=record.summary,
        attack_distribution=attack_dist,
        most_common_attack=summary.get("most_common_attack"),
        average_confidence=summary.get("average_confidence"),
        highest_confidence=summary.get("highest_confidence"),
        threat_level=summary.get("threat_level"),
        analysis_duration=summary.get("analysis_duration"),
        created_at=record.created_at,
    )
