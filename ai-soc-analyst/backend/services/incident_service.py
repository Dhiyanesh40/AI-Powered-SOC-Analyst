"""
Incident Management & Investigation Service.

Handles incident lifecycle — creation from alerts, paginated retrieval,
updates, and placeholder multi-agent investigation triggering.
"""

import logging
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.incident import Incident
from backend.models.agent_run import AgentRun
from backend.schemas.incident import IncidentCreate

logger = logging.getLogger(__name__)


async def create_incident(
    db: AsyncSession,
    incident_data: IncidentCreate,
) -> Incident:
    """
    Create a new incident, typically escalated from one or more alerts.

    Args:
        db: Async database session.
        incident_data: Validated incident creation payload.

    Returns:
        The persisted Incident record.
    """
    logger.info("Creating incident — title=%s", incident_data.title)

    incident = Incident(
        id=str(uuid4()),
        title=incident_data.title,
        description=incident_data.description,
        severity=incident_data.severity,
        status="open",
        alert_id=getattr(incident_data, "alert_id", None),
        attack_type=getattr(incident_data, "attack_type", None),
        assigned_to=getattr(incident_data, "assigned_to", None),
    )

    db.add(incident)
    await db.commit()
    await db.refresh(incident)

    logger.info("Incident created: id=%s", incident.id)
    return incident


async def get_incidents(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 50,
) -> tuple[list[Incident], int]:
    """
    Retrieve incidents with pagination.

    Args:
        db: Async database session.
        page: 1-indexed page number.
        page_size: Number of records per page.

    Returns:
        A tuple of (list_of_incidents, total_count).
    """
    logger.debug("Fetching incidents — page=%d, size=%d", page, page_size)

    # ── Total count ────────────────────────────────────────────────────
    count_stmt = select(func.count(Incident.id))
    total = (await db.execute(count_stmt)).scalar() or 0

    # ── Paginated results ──────────────────────────────────────────────
    offset = (page - 1) * page_size
    query = (
        select(Incident)
        .order_by(Incident.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)
    incidents = list(result.scalars().all())

    logger.debug("Returning %d incidents (total=%d)", len(incidents), total)
    return incidents, total


async def get_incident_by_id(
    db: AsyncSession,
    incident_id: str,
) -> Optional[Incident]:
    """
    Retrieve a single incident by its UUID.

    Args:
        db: Async database session.
        incident_id: UUID string of the incident.

    Returns:
        The matching Incident, or None.
    """
    stmt = select(Incident).where(Incident.id == incident_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def update_incident(
    db: AsyncSession,
    incident_id: str,
    update_data: dict,
) -> Optional[Incident]:
    """
    Update one or more fields on an existing incident.

    Args:
        db: Async database session.
        incident_id: UUID string of the incident to update.
        update_data: Dictionary of field names → new values.

    Returns:
        The updated Incident, or None if not found.
    """
    logger.info("Updating incident %s with fields: %s", incident_id, list(update_data.keys()))

    incident = await get_incident_by_id(db, incident_id)
    if incident is None:
        logger.warning("Incident not found: %s", incident_id)
        return None

    stmt = (
        update(Incident)
        .where(Incident.id == incident_id)
        .values(**update_data)
    )
    await db.execute(stmt)
    await db.commit()
    await db.refresh(incident)

    logger.info("Incident updated: %s", incident_id)
    return incident


async def trigger_investigation(
    db: AsyncSession,
    incident_id: str,
) -> dict:
    """
    **PLACEHOLDER** — Trigger a LangGraph multi-agent investigation.

    In production this will orchestrate the Triage, Threat-Intel,
    Forensic, and Response agents via LangGraph.  For now it:
      1. Sets the incident status to ``investigating``.
      2. Creates an AgentRun record capturing simulated reasoning.
      3. Returns a status dictionary.

    Args:
        db: Async database session.
        incident_id: UUID of the incident to investigate.

    Returns:
        A dict with investigation status and agent-run metadata.

    Raises:
        ValueError: If the incident does not exist.
    """
    logger.info("Triggering investigation for incident: %s", incident_id)

    # ── Validate incident exists ───────────────────────────────────────
    incident = await get_incident_by_id(db, incident_id)
    if incident is None:
        logger.error("Cannot investigate — incident not found: %s", incident_id)
        raise ValueError(f"Incident {incident_id} not found")

    # ── Update incident status ─────────────────────────────────────────
    await update_incident(db, incident_id, {"status": "investigating"})

    # ── Create placeholder AgentRun ────────────────────────────────────
    agent_run = AgentRun(
        id=str(uuid4()),
        incident_id=incident_id,
        status="running",
        agent_type="multi-agent-investigation",
        reasoning=(
            "[Triage Agent] Analysing alert context and severity...\n"
            "[Threat-Intel Agent] Querying threat databases for IOC correlation...\n"
            "[Forensic Agent] Inspecting packet captures and log patterns...\n"
            "[Response Agent] Preparing mitigation playbook...\n"
        ),
        started_at=datetime.now(timezone.utc),
    )
    db.add(agent_run)
    await db.commit()
    await db.refresh(agent_run)

    logger.info("Investigation started — agent_run=%s", agent_run.id)

    return {
        "status": "investigating",
        "incident_id": incident_id,
        "agent_run_id": agent_run.id,
        "message": "Multi-agent investigation has been triggered (placeholder).",
    }
