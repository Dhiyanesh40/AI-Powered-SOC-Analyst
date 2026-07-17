from pydantic import BaseModel
from uuid import UUID
from typing import Dict, Any, List, Optional

class AgentTaskRequest(BaseModel):
    incident_id: UUID

class AgentTaskResponse(BaseModel):
    incident_id: UUID
    status: str
    report_id: Optional[UUID] = None
    agent_logs: List[Dict[str, Any]]

class AgentStreamMessage(BaseModel):
    incident_id: UUID
    agent_name: str
    thought: str
    action: Optional[str] = None
    timestamp: str
