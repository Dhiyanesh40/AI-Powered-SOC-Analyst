import logging
import json
from datetime import datetime
from agents.graph.state import AgentState
from agents.nodes.orchestrator import get_llm

logger = logging.getLogger(__name__)

class LogAnalysisNode:
    @staticmethod
    def execute(state: AgentState) -> AgentState:
        logger.info("Executing Log Analysis Node...")
        
        alert = state.get("alert_data", {})
        raw_features = alert.get("raw_features", {})
        
        # Extracted indicators of compromise (IoCs)
        iocs = {
            "source_ip": alert.get("source_ip"),
            "dest_ip": alert.get("dest_ip"),
            "source_port": alert.get("source_port"),
            "dest_port": alert.get("dest_port"),
            "protocol": alert.get("protocol"),
            "flow_duration": raw_features.get("Flow Duration", 0.0),
            "flags": {
                "syn": int(raw_features.get("SYN Flag Count", 0)),
                "rst": int(raw_features.get("RST Flag Count", 0)),
                "psh": int(raw_features.get("Fwd PSH Flags", 0)),
                "ack": int(raw_features.get("ACK Flag Count", 0))
            },
            "packet_sizes": {
                "avg": raw_features.get("Average Packet Size", 0.0),
                "fwd_mean": raw_features.get("Fwd Packet Length Mean", 0.0),
                "bwd_mean": raw_features.get("Bwd Packet Length Mean", 0.0)
            }
        }
        
        # Prompt LLM if available to review raw payload/log characteristics
        llm = get_llm()
        analysis_notes = ""
        if llm:
            try:
                prompt = (
                    f"You are a SOC Log Analyst. Analyze these network flow features: {json.dumps(iocs)}.\n"
                    f"Identify any technical anomalies (e.g. port scan signatures, massive packet sizes, or suspicious flag structures).\n"
                    f"Return a short technical analysis summary."
                )
                response = llm.invoke(prompt)
                analysis_notes = response.content
            except Exception as e:
                logger.error(f"LLM call failed in Log Analysis node: {e}")
                analysis_notes = "Failed to run LLM analysis. Using rule-based anomaly logs."
        else:
            # Rule-based fallback summary
            analysis_notes = "Completed log processing. "
            if iocs["flags"]["syn"] > 10:
                analysis_notes += "High SYN flag density detected (potential flood or port scan). "
            if iocs["flow_duration"] > 5000000:
                analysis_notes += "Prolonged flow duration detected for authentication port. "
                
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": "Log Analysis Agent",
            "action": "Extract Indicators",
            "message": f"Extracted network IoCs for {iocs['source_ip']} -> {iocs['dest_ip']} on Port {iocs['dest_port']}. Notes: {analysis_notes}"
        }
        
        agent_logs = state.get("agent_logs", [])
        agent_logs.append(log_entry)
        
        return {
            **state,
            "extracted_iocs": iocs,
            "agent_logs": agent_logs,
            "current_agent": "Log Analysis Agent"
        }
