import logging
import os
import uuid
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


@router.post("/", response_model=UploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CICIDS2017 CSV file.

    Sprint 2: 
    - Validates file type.
    - Saves uniquely inside uploads/ directory.
    - Reads with Pandas to extract rows, cols, preview.
    - Stores metadata in the AnalysisResult (metadata) table.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    logger.info("File received: %s", file.filename)

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = UPLOAD_DIR / unique_filename

    # Save file
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.")

    # Read CSV with pandas
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        logger.error(f"Failed to read CSV: {e}")
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid CSV or is unreadable.")
    
    total_records = len(df)
    num_columns = len(df.columns)
    columns = df.columns.tolist()
    
    # Fill NaNs with None to ensure JSON serialization works
    df_preview = df.head(10).where(pd.notnull(df), None)
    preview = df_preview.to_dict(orient="records")

    # Store metadata. The instruction explicitly said "Store upload metadata in the SecurityLog table" 
    from models.security_log import SecurityLog
    meta_log = SecurityLog(
        source_ip="SYSTEM",
        dest_ip="SYSTEM",
        source_port=num_columns,
        dest_port=total_records,
        protocol="META",
        label=f"FILE_UPLOAD:{unique_filename}",
        created_at=datetime.utcnow()
    )
    db.add(meta_log)

    analysis_record = AnalysisResult(
        filename=unique_filename,
        total_records=total_records,
        created_at=datetime.utcnow()
    )
    db.add(analysis_record)
    db.commit()

    return UploadResponse(
        filename=unique_filename,
        total_records=total_records,
        num_columns=num_columns,
        columns=columns,
        preview=preview,
        status="success",
    )
