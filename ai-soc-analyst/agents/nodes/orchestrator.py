import logging
from datetime import datetime
from agents.graph.state import AgentState
from langchain_google_genai import ChatGoogleGenerativeAI
from backend.core.config import settings

logger = logging.getLogger(__name__)

def get_llm():
    """
    Load Gemini API LLM if key is configured, else return None (triggers mock fallback).
    """
    if settings.GEMINI_API_KEY:
        try:
            return ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.1
            )
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {e}")
    return None

class OrchestratorNode:
    @staticmethod
    def execute(state: AgentState) -> AgentState:
        logger.info("Executing Orchestrator Node...")
        
        alert = state.get("alert_data", {})
        severity = alert.get("severity", "medium").lower()
        confidence = alert.get("confidence", 1.0)
        
        # Log action trace
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": "Orchestrator Agent",
            "action": "Triage Alert",
            "message": f"Evaluating alert {alert.get('id')} with severity {severity} (Confidence: {confidence})"
        }
        
        # Initialize mutable variables if missing
        agent_logs = state.get("agent_logs", [])
        agent_logs.append(log_entry)
        
        requires_human = False
        # If low confidence or warning/info, route to human review instead of auto-investigating
        if confidence < 0.6 or severity in ["info"]:
            requires_human = True
            log_entry["message"] += " -> Flagged for Human Review due to low confidence or low severity."
            
        return {
            **state,
            "agent_logs": agent_logs,
            "requires_human_review": requires_human,
            "current_agent": "Orchestrator Agent"
        }
