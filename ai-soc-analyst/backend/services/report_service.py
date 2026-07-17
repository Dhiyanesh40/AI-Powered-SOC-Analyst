"""
Report Generation Service.

Generates, persists, and retrieves investigation reports.
Currently uses placeholder AI-generated content; will be replaced
by LLM-powered summarisation once the agent pipeline is integrated.
"""

import logging
from typing import Optional
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.incident import Incident
from backend.models.report import Report

logger = logging.getLogger(__name__)


async def generate_report(db: AsyncSession, incident_id: str) -> Report:
    """
    **PLACEHOLDER** — Generate an investigation report for an incident.

    Fetches the related incident, builds placeholder sections
    (executive summary, technical details, remediation steps),
    and persists the Report to the database.

    In production this will be replaced by LLM-powered content
    generation using the investigation's agent-run outputs.

    Args:
        db: Async database session.
        incident_id: UUID of the incident to report on.

    Returns:
        The persisted Report record.

    Raises:
        ValueError: If the incident does not exist.
    """
    logger.info("Generating report for incident: %s", incident_id)

    # ── Validate incident ──────────────────────────────────────────────
    stmt = select(Incident).where(Incident.id == incident_id)
    result = await db.execute(stmt)
    incident = result.scalars().first()

    if incident is None:
        logger.error("Cannot generate report — incident not found: %s", incident_id)
        raise ValueError(f"Incident {incident_id} not found")

    # ── Build placeholder report content ───────────────────────────────
    title = f"Investigation Report — {incident.title}"

    executive_summary = (
        f"This report summarises the investigation into incident "
        f"'{incident.title}' (ID: {incident.id}). The incident was "
        f"classified as {incident.severity} severity with attack type "
        f"'{getattr(incident, 'attack_type', 'Unknown')}'. "
        f"A multi-agent investigation pipeline analysed the related "
        f"alerts and network telemetry to determine root cause and impact."
    )

    technical_details = (
        "## Technical Analysis\n\n"
        "### Network Traffic Analysis\n"
        "- Anomalous traffic patterns detected between source and destination IPs.\n"
        "- Packet payload analysis revealed suspicious byte sequences.\n\n"
        "### Threat Intelligence Correlation\n"
        "- Source IP cross-referenced against known threat databases.\n"
        "- MITRE ATT&CK techniques mapped: T1190 (Exploit Public-Facing Application), "
        "T1071 (Application Layer Protocol).\n\n"
        "### Timeline Reconstruction\n"
        "- Initial access detected via anomalous inbound connection.\n"
        "- Lateral movement indicators observed in subsequent log entries.\n"
        "- Data exfiltration attempt flagged by egress traffic analysis.\n"
    )

    remediation_steps = (
        "## Recommended Remediation\n\n"
        "1. **Immediate**: Block the source IP at the perimeter firewall.\n"
        "2. **Short-term**: Rotate credentials for affected service accounts.\n"
        "3. **Medium-term**: Patch the exploited vulnerability (CVE-XXXX-XXXX).\n"
        "4. **Long-term**: Implement network segmentation to limit lateral movement.\n"
        "5. **Monitoring**: Add targeted detection rules for the identified TTPs.\n"
    )

    full_content = (
        f"# {title}\n\n"
        f"## Executive Summary\n\n{executive_summary}\n\n"
        f"{technical_details}\n"
        f"{remediation_steps}"
    )

    # ── Persist the report ─────────────────────────────────────────────
    report = Report(
        id=str(uuid4()),
        incident_id=incident_id,
        title=title,
        content=full_content,
        executive_summary=executive_summary,
        technical_details=technical_details,
        remediation_steps=remediation_steps,
    )

    db.add(report)
    await db.commit()
    await db.refresh(report)

    logger.info("Report generated: id=%s for incident=%s", report.id, incident_id)
    return report


async def get_reports(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 50,
) -> tuple[list[Report], int]:
    """
    Retrieve reports with pagination.

    Args:
        db: Async database session.
        page: 1-indexed page number.
        page_size: Number of records per page.

    Returns:
        A tuple of (list_of_reports, total_count).
    """
    logger.debug("Fetching reports — page=%d, size=%d", page, page_size)

    # ── Total count ────────────────────────────────────────────────────
    count_stmt = select(func.count(Report.id))
    total = (await db.execute(count_stmt)).scalar() or 0

    # ── Paginated results ──────────────────────────────────────────────
    offset = (page - 1) * page_size
    query = (
        select(Report)
        .order_by(Report.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(query)
    reports = list(result.scalars().all())

    logger.debug("Returning %d reports (total=%d)", len(reports), total)
    return reports, total


async def get_report_by_id(
    db: AsyncSession,
    report_id: str,
) -> Optional[Report]:
    """
    Retrieve a single report by its UUID.

    Args:
        db: Async database session.
        report_id: UUID string of the report.

    Returns:
        The matching Report, or None.
    """
    stmt = select(Report).where(Report.id == report_id)
    result = await db.execute(stmt)
    return result.scalars().first()
