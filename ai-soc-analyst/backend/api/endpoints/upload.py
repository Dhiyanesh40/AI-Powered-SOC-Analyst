import logging
import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime
import pandas as pd

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.schemas import UploadResponse
from db.session import get_db
from models.analysis_result import AnalysisResult

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def count_file_lines(file_path: Path) -> int:
    """Efficiently count lines in a large file without loading it into memory."""
    with open(file_path, "rb") as f:
        # Count newline characters in blocks
        lines = sum(buf.count(b'\n') for buf in iter(lambda: f.read(1024 * 1024), b''))
    return lines


@router.post("/", response_model=UploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CICIDS2017 CSV file.

    Sprint 2: 
    - Validates file type.
    - Saves uniquely inside uploads/ directory using chunked streaming.
    - Reads with Pandas efficiently to prevent memory crashes on large files.
    - Stores metadata in the AnalysisResult (metadata) table.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    logger.info("File received: %s", file.filename)
    logger.info("STEP 1 - File received")

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file efficiently in chunks to prevent memory overload
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info("STEP 2 - File saved successfully")
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.")
    finally:
        file.file.close()

    # Process CSV efficiently
    try:
        # Read only the first 10 rows to extract columns and preview
        df_preview = pd.read_csv(file_path, nrows=10)
        logger.info("STEP 3 - CSV preview loaded")
    except Exception as e:
        logger.error(f"Failed to read CSV preview: {e}")
        # Clean up the bad file
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid CSV or is unreadable.")
    
    num_columns = len(df_preview.columns)
    columns = df_preview.columns.tolist()
    
    # Fill NaNs with None to ensure JSON serialization works
    df_preview = df_preview.where(pd.notnull(df_preview), None)
    preview = df_preview.to_dict(orient="records")

    # Efficiently count total records (subtracting 1 for the header)
    total_lines = count_file_lines(file_path)
    logger.info("STEP 4 - Counted file lines")
    total_records = max(0, total_lines - 1)

    # Create AnalysisResult
    analysis_record = AnalysisResult(
        filename=unique_filename,
        total_records=total_records,
        created_at=datetime.utcnow()
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    # Log Upload events
    from models.security_log import SecurityLog
    
    upload_started = SecurityLog(
        analysis_id=analysis_record.id,
        dataset_filename=unique_filename,
        event_type="CSV Upload Started",
        current_stage="Upload",
        status="Success",
        details=f"Started upload for {file.filename}",
        timestamp=datetime.utcnow()
    )
    
    upload_completed = SecurityLog(
        analysis_id=analysis_record.id,
        dataset_filename=unique_filename,
        event_type="CSV Upload Completed",
        current_stage="Upload",
        status="Success",
        details=f"Completed upload for {file.filename}. Parsed {total_records} records.",
        timestamp=datetime.utcnow()
    )
    
    db.add_all([upload_started, upload_completed])
    logger.info("STEP 5 - About to commit database")
    db.commit()
    logger.info("STEP 6 - Database commit successful")
    logger.info("STEP 7 - Returning response")

    return UploadResponse(
        filename=unique_filename,
        total_records=total_records,
        num_columns=num_columns,
        columns=columns,
        preview=preview,
        status="success",
    )


@router.get("/latest")
def get_latest_upload(db: Session = Depends(get_db)):
    """Fetch the latest uploaded file metadata, preview, and analysis (if any)."""
    # Find the most recent analysis record
    latest_record = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).first()
    
    if not latest_record:
        return {"uploadResult": None, "analysisResult": None}
        
    file_path = UPLOAD_DIR / latest_record.filename
    
    upload_result = None
    if file_path.exists():
        try:
            df_preview = pd.read_csv(file_path, nrows=10)
            df_preview = df_preview.where(pd.notnull(df_preview), None)
            preview = df_preview.to_dict(orient="records")
            
            upload_result = {
                "filename": latest_record.filename,
                "total_records": latest_record.total_records,
                "num_columns": len(df_preview.columns),
                "columns": df_preview.columns.tolist(),
                "preview": preview,
                "status": "success",
            }
        except Exception as e:
            logger.error(f"Failed to read CSV preview for latest upload: {e}")
            
    analysis_result = None
    if latest_record.threats_detected is not None:
        analysis_result = {
            "filename": latest_record.filename,
            "total_records": latest_record.total_records,
            "threats_detected": latest_record.threats_detected,
            "threat_level": latest_record.severity,
            "most_common_attack": latest_record.attack_types,
            "analysis_duration": latest_record.processing_time,
            "average_confidence": latest_record.average_confidence,
            "attack_distribution": latest_record.attack_distribution,
            "created_at": latest_record.created_at.isoformat() + "Z" if latest_record.created_at else None,
        }

    return {
        "uploadResult": upload_result,
        "analysisResult": analysis_result
    }
