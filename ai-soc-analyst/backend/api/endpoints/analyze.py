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

    # Find existing AnalysisResult early to attach events
    existing = db.query(AnalysisResult).filter(
        AnalysisResult.filename == request.filename
    ).first()

    if not existing:
        existing = AnalysisResult(filename=request.filename, created_at=datetime.utcnow())
        db.add(existing)
        db.commit()
        db.refresh(existing)

    from models.security_log import SecurityLog
    from models.generated_report import GeneratedReport

    def log_event(stage, ev_type, status, details, duration=None):
        ev = SecurityLog(
            analysis_id=existing.id,
            dataset_filename=request.filename,
            event_type=ev_type,
            current_stage=stage,
            status=status,
            details=details,
            duration=duration,
            timestamp=datetime.utcnow()
        )
        db.add(ev)
        db.commit()

    log_event("Preprocessing", "Dataset Parsed", "Success", "Loaded dataset features for prediction.")
    log_event("ML Prediction", "ML Analysis Started", "In Progress", "Running multi-class XGBoost classifier.")

    # ── Run the ML prediction pipeline ──
    try:
        from ml.predict import predict_dataset
        summary = predict_dataset(str(filepath))
    except RuntimeError as e:
        logger.error("ML model error: %s", e)
        log_event("ML Prediction", "Analysis Failed", "Error", str(e))
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("Analysis failed: %s", e)
        log_event("ML Prediction", "Analysis Failed", "Error", str(e))
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    duration = summary.get("analysis_duration")
    log_event("ML Prediction", "Prediction Completed", "Success", f"Completed classification of {summary['total_records']} flows.", duration)

    # ── Determine severity from threat level ──
    severity = summary.get("threat_level", "Low")

    # ── Build attack types string ──
    attack_dist = summary.get("attack_distribution", {})
    attack_types_str = ", ".join(
        f"{k} ({v})" for k, v in sorted(attack_dist.items(), key=lambda x: -x[1])
    )

    log_event("Reporting", "Threat Summary Generated", "Success", f"Identified {summary['threats_detected']} malicious flows. Top threat: {summary.get('most_common_attack', 'None')}")

    # ── Build human-readable summary ──
    readable_summary = (
        f"Analyzed {summary['total_records']} records in {summary['analysis_duration']}s. "
        f"Detected {summary['threats_detected']} threats. "
        f"Most common attack: {summary.get('most_common_attack', 'None')}. "
        f"Average confidence: {summary.get('average_confidence', 0):.2%}. "
        f"Threat level: {severity}."
    )

    # ── Update AnalysisResult ──
    existing.total_records = summary["total_records"]
    existing.threats_detected = summary["threats_detected"]
    existing.severity = severity
    existing.attack_types = attack_types_str
    existing.summary = readable_summary
    existing.processing_time = summary.get("analysis_duration")
    existing.average_confidence = summary.get("average_confidence")
    existing.attack_distribution = json.dumps(attack_dist)
    db.commit()
    db.refresh(existing)

    # ── Generate Report ──
    report = GeneratedReport(
        analysis_id=existing.id,
        title=f"Incident Report: {request.filename}",
        severity=severity,
        executive_summary=readable_summary,
        technical_details=f"Attack Distribution: {json.dumps(attack_dist)}. Processing time: {summary.get('analysis_duration')}s.",
        remediation_steps="Investigate flagged IPs immediately." if severity in ["High", "Critical"] else "Continue monitoring.",
        created_at=datetime.utcnow()
    )
    db.add(report)
    db.commit()

    log_event("Reporting", "Analysis Completed", "Success", f"Finalized analysis and generated report ID #{report.id}.")

    return AnalysisResultResponse(
        id=existing.id,
        filename=existing.filename,
        total_records=existing.total_records,
        threats_detected=existing.threats_detected,
        severity=existing.severity,
        attack_types=existing.attack_types,
        summary=existing.summary,
        attack_distribution=attack_dist,
        most_common_attack=summary.get("most_common_attack"),
        average_confidence=summary.get("average_confidence"),
        highest_confidence=summary.get("highest_confidence"),
        threat_level=summary.get("threat_level"),
        analysis_duration=summary.get("analysis_duration"),
        created_at=existing.created_at,
    )
