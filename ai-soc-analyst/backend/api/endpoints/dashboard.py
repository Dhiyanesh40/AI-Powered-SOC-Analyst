import logging
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.session import get_db
from models.analysis_result import AnalysisResult

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Returns aggregated metrics across all AnalysisResults for the Dashboard.
    """
    analyses = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).all()
    
    total_analyses = len(analyses)
    total_logs = sum(a.total_records for a in analyses) if total_analyses else 0
    total_threats = sum(a.threats_detected for a in analyses) if total_analyses else 0
    threat_rate = (total_threats / total_logs) if total_logs > 0 else 0.0

    # Averages
    valid_confidences = [a.average_confidence for a in analyses if a.average_confidence is not None]
    average_confidence = sum(valid_confidences) / len(valid_confidences) if valid_confidences else 0.0

    valid_times = [a.processing_time for a in analyses if a.processing_time is not None]
    average_processing_time = sum(valid_times) / len(valid_times) if valid_times else 0.0

    # Attack Distribution (aggregate)
    overall_dist = {}
    for a in analyses:
        if a.attack_distribution:
            try:
                dist = json.loads(a.attack_distribution)
                for k, v in dist.items():
                    overall_dist[k] = overall_dist.get(k, 0) + v
            except:
                pass

    latest = analyses[0] if analyses else None
    latest_dict = None
    if latest:
        latest_dict = {
            "id": latest.id,
            "filename": latest.filename,
            "total_records": latest.total_records,
            "threats_detected": latest.threats_detected,
            "severity": latest.severity,
            "processing_time": latest.processing_time,
            "created_at": latest.created_at.isoformat() + "Z" if latest.created_at else None
        }

    recent_analyses = []
    for a in analyses[:5]:
        recent_analyses.append({
            "id": a.id,
            "filename": a.filename,
            "threats_detected": a.threats_detected,
            "severity": a.severity,
            "created_at": a.created_at.isoformat() + "Z" if a.created_at else None
        })

    return {
        "total_analyses": total_analyses,
        "total_logs_processed": total_logs,
        "total_threats_detected": total_threats,
        "threat_rate": threat_rate,
        "average_confidence": average_confidence,
        "average_processing_time": average_processing_time,
        "attack_distribution": overall_dist,
        "latest_analysis": latest_dict,
        "recent_analyses": recent_analyses
    }
