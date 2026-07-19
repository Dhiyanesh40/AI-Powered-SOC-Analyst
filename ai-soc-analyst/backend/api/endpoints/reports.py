import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from core.exceptions import NotFoundException
from db.session import get_db
from models.generated_report import GeneratedReport
from models.analysis_result import AnalysisResult

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
def get_reports(db: Session = Depends(get_db)):
    """
    Retrieve all incident reports, joined with AnalysisResult.
    """
    logger.info("Fetching reports.")
    results = db.query(GeneratedReport, AnalysisResult).join(
        AnalysisResult, GeneratedReport.analysis_id == AnalysisResult.id
    ).order_by(GeneratedReport.created_at.desc()).all()
    
    reports = []
    for report, analysis in results:
        reports.append({
            "id": report.id,
            "filename": analysis.filename,
            "detected_threats": analysis.threats_detected,
            "threat_level": report.severity,
            "attack_types": analysis.attack_types,
            "confidence": f"{analysis.average_confidence * 100:.2f}%" if analysis.average_confidence else "N/A",
            "date": report.created_at.isoformat() + "Z" if report.created_at else None,
            "status": "Finalized",
            "executive_summary": report.executive_summary,
            "technical_details": report.technical_details,
            "remediation_steps": report.remediation_steps
        })
        
    return reports


@router.get("/{report_id}")
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific incident report by ID.
    """
    logger.info("Fetching report %d.", report_id)
    
    result = db.query(GeneratedReport, AnalysisResult).join(
        AnalysisResult, GeneratedReport.analysis_id == AnalysisResult.id
    ).filter(GeneratedReport.id == report_id).first()
    
    if not result:
        raise NotFoundException(detail=f"Report with ID {report_id} not found.")
        
    report, analysis = result
    
    return {
        "id": report.id,
        "filename": analysis.filename,
        "detected_threats": analysis.threats_detected,
        "threat_level": report.severity,
        "attack_types": analysis.attack_types,
        "confidence": f"{analysis.average_confidence * 100:.2f}%" if analysis.average_confidence else "N/A",
        "date": report.created_at.isoformat() + "Z" if report.created_at else None,
        "status": "Finalized",
        "executive_summary": report.executive_summary,
        "technical_details": report.technical_details,
        "remediation_steps": report.remediation_steps
    }


@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    """
    Delete a specific incident report by ID.
    Also log the deletion.
    """
    logger.info("Deleting report %d.", report_id)
    report = db.query(GeneratedReport).filter(GeneratedReport.id == report_id).first()
    
    if not report:
        raise NotFoundException(detail=f"Report with ID {report_id} not found.")
        
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == report.analysis_id).first()
    
    # Log the deletion
    if analysis:
        from models.security_log import SecurityLog
        log_entry = SecurityLog(
            analysis_id=analysis.id,
            dataset_filename=analysis.filename,
            event_type="Report Deleted",
            current_stage="Reports",
            status="Success",
            details=f"Deleted report #{report_id} for {analysis.filename}",
            timestamp=datetime.utcnow()
        )
        db.add(log_entry)
        
    db.delete(report)
    db.commit()
    
    return {"status": "success", "detail": f"Report {report_id} deleted successfully."}
