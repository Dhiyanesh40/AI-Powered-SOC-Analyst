import logging

from fastapi import APIRouter, UploadFile, File

from schemas.schemas import UploadResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a CICIDS2017 CSV file.

    Sprint 1: Accepts the file and returns a placeholder response.
              The file is NOT parsed or stored yet.
    Sprint 2: Will parse CSV, run ML inference, and create SecurityLog entries.
    """
    logger.info("File received: %s (%s bytes)", file.filename, file.size)

    return UploadResponse(
        filename=file.filename,
        total_records=0,
        status="received",
    )
