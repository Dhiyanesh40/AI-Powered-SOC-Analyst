from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    # Inputs
    alert_data: Dict[str, Any]
    raw_logs: List[Dict[str, Any]]
    
    # Intermediate variables passed between nodes
    extracted_iocs: Dict[str, Any]
    attack_classification: Dict[str, Any]
    threat_context: str
    investigation_summary: str
    mitigation_steps: List[str]
    
    # Final outputs
    final_report: str
    
    # Execution tracing and routing variables
    agent_logs: List[Dict[str, Any]]
    error: Optional[str]
    requires_human_review: bool
    current_agent: str
    retry_count: int
