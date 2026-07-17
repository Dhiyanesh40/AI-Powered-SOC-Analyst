import logging
from datetime import datetime
from agents.graph.state import AgentState
from agents.tools.chroma_retriever import ThreatIntelRetriever

logger = logging.getLogger(__name__)

# Initialize local retriever tool
retriever_tool = ThreatIntelRetriever()

class ThreatIntelRAGNode:
    @staticmethod
    def execute(state: AgentState) -> AgentState:
        logger.info("Executing Threat Intel RAG Node...")
        
        classification = state.get("attack_classification", {})
        attack_type = classification.get("type", "General Intrusion")
        
        # Build query for vector DB
        query = f"Mitigation strategies and security details for {attack_type} attack"
        
        # Run retrieval
        threat_context = retriever_tool.retrieve(query)
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": "Threat Intelligence Agent",
            "action": "Query Knowledge Base",
            "message": f"Queried vector store with: '{query}'. Retrieved matching security context."
        }
        
        agent_logs = state.get("agent_logs", [])
        agent_logs.append(log_entry)
        
        return {
            **state,
            "threat_context": threat_context,
            "agent_logs": agent_logs,
            "current_agent": "Threat Intelligence Agent"
        }
