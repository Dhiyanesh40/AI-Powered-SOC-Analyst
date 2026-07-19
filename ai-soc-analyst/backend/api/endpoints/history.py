import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import defaultdict

from db.session import get_db
from models.security_log import SecurityLog

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
def get_history(db: Session = Depends(get_db)):
    """
    Retrieve the chronological log of system activity grouped by dataset.
    """
    logger.info("Fetching history.")
    logs = db.query(SecurityLog).order_by(SecurityLog.timestamp.desc()).all()
    
    # Group by dataset_filename
    grouped = defaultdict(list)
    for log in logs:
        grouped[log.dataset_filename].append({
            "id": log.id,
            "timestamp": log.timestamp.isoformat() + "Z" if log.timestamp else None,
            "type": log.event_type,
            "stage": log.current_stage,
            "status": log.status,
            "duration": f"{log.duration}s" if log.duration else None,
            "details": log.details
        })
    
    # Format into a list of jobs
    jobs = []
    for dataset, events in grouped.items():
        # Sort events within a job chronologically (oldest to newest)
        events.sort(key=lambda x: x["id"])
        jobs.append({
            "dataset": dataset,
            "events": events
        })
        
    return jobs

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    """
    Retrieve the 10 most recent system events for notifications.
    """
    logs = db.query(SecurityLog).order_by(SecurityLog.timestamp.desc()).limit(20).all()
    
    notifications = []
    for log in logs:
        notifications.append({
            "id": log.id,
            "timestamp": log.timestamp.isoformat() + "Z" if log.timestamp else None,
            "title": log.event_type,
            "message": log.details,
            "status": log.status,
            "is_read": False # Frontend will manage read state locally or we can just send it as false
        })
        
    return notifications
