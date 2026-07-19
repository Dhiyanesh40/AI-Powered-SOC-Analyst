from fastapi import APIRouter

from api.endpoints import upload, analyze, reports, history, dashboard

"""
Central API router.

All endpoint routers are registered here with their path prefix and tag.
Import this single router in main.py to mount every route group at once.
"""

router = APIRouter()

router.include_router(upload.router,   prefix="/upload",   tags=["Upload"])
router.include_router(analyze.router,  prefix="/analyze",  tags=["Analyze"])
router.include_router(reports.router,  prefix="/reports",  tags=["Reports"])
router.include_router(history.router,  prefix="/history",  tags=["History"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
