"""
Dashboard Aggregation Service.

Provides a single endpoint-ready function that computes all
key SOC dashboard metrics in one pass: counts, breakdowns,
and recent activity.
"""

import logging

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.alert import Alert
from backend.models.incident import Incident

logger = logging.getLogger(__name__)


async def get_dashboard_stats(db: AsyncSession) -> dict:
    """
    Compute aggregate dashboard statistics.

    Returns a dictionary containing:
        - total_alerts: Total alert count.
        - open_alerts: Alerts with status ``open``.
        - total_incidents: Total incident count.
        - open_incidents: Incidents with status ``open``.
        - resolved_incidents: Incidents with status ``resolved``.
        - severity_breakdown: ``{severity: count}`` mapping.
        - recent_alerts: Last 10 alerts (most recent first).
        - attack_type_distribution: ``{attack_type: count}`` mapping.

    Args:
        db: Async database session.

    Returns:
        A dict of dashboard metrics.
    """
    logger.info("Computing dashboard statistics")

    # ── Alert counts ───────────────────────────────────────────────────
    alert_counts_stmt = select(
        func.count(Alert.id).label("total"),
        func.count(case((Alert.status == "open", Alert.id))).label("open"),
    )
    alert_row = (await db.execute(alert_counts_stmt)).one()
    total_alerts = alert_row.total or 0
    open_alerts = alert_row.open or 0

    # ── Incident counts ────────────────────────────────────────────────
    incident_counts_stmt = select(
        func.count(Incident.id).label("total"),
        func.count(case((Incident.status == "open", Incident.id))).label("open"),
        func.count(case((Incident.status == "resolved", Incident.id))).label("resolved"),
    )
    incident_row = (await db.execute(incident_counts_stmt)).one()
    total_incidents = incident_row.total or 0
    open_incidents = incident_row.open or 0
    resolved_incidents = incident_row.resolved or 0

    # ── Severity breakdown (alerts) ────────────────────────────────────
    severity_stmt = (
        select(Alert.severity, func.count(Alert.id))
        .group_by(Alert.severity)
    )
    severity_rows = (await db.execute(severity_stmt)).all()
    severity_breakdown = {row[0]: row[1] for row in severity_rows if row[0] is not None}

    # ── Attack-type distribution (alerts) ──────────────────────────────
    attack_stmt = (
        select(Alert.attack_type, func.count(Alert.id))
        .group_by(Alert.attack_type)
    )
    attack_rows = (await db.execute(attack_stmt)).all()
    attack_type_distribution = {row[0]: row[1] for row in attack_rows if row[0] is not None}

    # ── Recent alerts (last 10) ────────────────────────────────────────
    recent_stmt = (
        select(Alert)
        .order_by(Alert.created_at.desc())
        .limit(10)
    )
    recent_result = await db.execute(recent_stmt)
    recent_alerts = list(recent_result.scalars().all())

    stats = {
        "total_alerts": total_alerts,
        "open_alerts": open_alerts,
        "total_incidents": total_incidents,
        "open_incidents": open_incidents,
        "resolved_incidents": resolved_incidents,
        "severity_breakdown": severity_breakdown,
        "recent_alerts": recent_alerts,
        "attack_type_distribution": attack_type_distribution,
    }

    logger.info(
        "Dashboard stats: %d alerts (%d open), %d incidents (%d open, %d resolved)",
        total_alerts, open_alerts, total_incidents, open_incidents, resolved_incidents,
    )
    return stats
