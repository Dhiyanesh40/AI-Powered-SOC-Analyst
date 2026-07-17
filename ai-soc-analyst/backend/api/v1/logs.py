from fastapi import APIRouter, Depends, UploadFile, File, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.api.dependencies import get_db, get_current_user
from backend.services.log_service import LogService
from backend.schemas.log_entry import LogUploadResponse
from backend.models.user import User

router = APIRouter()

@router.post("/upload", response_model=LogUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_logs(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only CSV files are supported."
        )
        
    try:
        response = await LogService.process_csv_upload(file, db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing log file: {str(e)}"
        )
