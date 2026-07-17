import logging
from datetime import datetime
from agents.graph.state import AgentState
from agents.nodes.orchestrator import get_llm

logger = logging.getLogger(__name__)

class ThreatDetectionNode:
    @staticmethod
    def execute(state: AgentState) -> AgentState:
        logger.info("Executing Threat Detection Node...")
        
        alert = state.get("alert_data", {})
        iocs = state.get("extracted_iocs", {})
        
        attack_type = alert.get("attack_type", "Unknown Anomaly")
        base_severity = alert.get("severity", "medium")
        confidence = alert.get("confidence", 1.0)
        
        # Verify ML classification using expert rules / logic
        verified_type = attack_type
        verified_severity = base_severity
        
        # Validate PortScan
        if attack_type == "PortScan" and iocs.get("flags", {}).get("syn", 0) > 0:
            verified_type = "PortScan (SYN Scan)"
            verified_severity = "high"
        elif attack_type == "DDoS" and iocs.get("flow_duration", 0) > 1000000:
            verified_severity = "critical"
            
        classification = {
            "type": verified_type,
            "severity": verified_severity,
            "confidence": confidence,
            "status": "verified"
        }
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": "Threat Detection Agent",
            "action": "Classify Attack",
            "message": f"Verified ML alert as {verified_type}. Final assigned severity: {verified_severity}."
        }
        
        agent_logs = state.get("agent_logs", [])
        agent_logs.append(log_entry)
        
        return {
            **state,
            "attack_classification": classification,
            "agent_logs": agent_logs,
            "current_agent": "Threat Detection Agent"
        }
