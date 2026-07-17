import logging
from langgraph.graph import StateGraph, END
from agents.graph.state import AgentState
from agents.nodes.orchestrator import OrchestratorNode
from agents.nodes.log_analysis import LogAnalysisNode
from agents.nodes.threat_detection import ThreatDetectionNode
from agents.nodes.threat_intel_rag import ThreatIntelRAGNode
from agents.nodes.investigation import InvestigationNode
from agents.nodes.report_generation import ReportGenerationNode

logger = logging.getLogger(__name__)

def route_orchestrator(state: AgentState) -> str:
    """
    Decides the path after the Orchestrator evaluates the alert.
    If the alert is flagged as requiring human review (due to low confidence 
    or low severity), it bypasses automated investigation.
    """
    if state.get("requires_human_review", False):
        return "end"
    return "log_analysis"

def build_workflow():
    # Initialize state graph with custom schema
    workflow = StateGraph(AgentState)
    
    # Register Node executors
    workflow.add_node("orchestrator", OrchestratorNode.execute)
    workflow.add_node("log_analysis", LogAnalysisNode.execute)
    workflow.add_node("threat_detection", ThreatDetectionNode.execute)
    workflow.add_node("threat_intel_rag", ThreatIntelRAGNode.execute)
    workflow.add_node("investigation", InvestigationNode.execute)
    workflow.add_node("report_generation", ReportGenerationNode.execute)
    
    # Configure routing pathways
    workflow.set_entry_point("orchestrator")
    
    # Conditional edge route from Orchestrator
    workflow.add_conditional_edges(
        "orchestrator",
        route_orchestrator,
        {
            "log_analysis": "log_analysis",
            "end": END
        }
    )
    
    # Sequential workflows
    workflow.add_edge("log_analysis", "threat_detection")
    workflow.add_edge("threat_detection", "threat_intel_rag")
    workflow.add_edge("threat_intel_rag", "investigation")
    workflow.add_edge("investigation", "report_generation")
    workflow.add_edge("report_generation", END)
    
    # Compile graph
    app = workflow.compile()
    logger.info("LangGraph agent workflow successfully built and compiled.")
    return app

# Expose compiled state graph
compiled_graph = build_workflow()
