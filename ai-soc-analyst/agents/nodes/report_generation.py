import logging
from datetime import datetime
from agents.graph.state import AgentState
from agents.nodes.orchestrator import get_llm

logger = logging.getLogger(__name__)

class ReportGenerationNode:
    @staticmethod
    def execute(state: AgentState) -> AgentState:
        logger.info("Executing Report Generation Node...")
        
        alert = state.get("alert_data", {})
        classification = state.get("attack_classification", {})
        iocs = state.get("extracted_iocs", {})
        summary = state.get("investigation_summary", "")
        mitigations = state.get("mitigation_steps", [])
        
        llm = get_llm()
        report_markdown = ""
        
        if llm:
            try:
                prompt = (
                    f"You are a SOC Reporter. Take the following incident analysis and generate a comprehensive markdown report:\n"
                    f"1. Classification: {classification}\n"
                    f"2. IoCs: {iocs}\n"
                    f"3. Narrative: {summary}\n"
                    f"4. Mitigations: {mitigations}\n\n"
                    f"Format the output strictly with professional headers (Executive Summary, Technical Breakdown, IOCs Table, Mitigation Playbook)."
                )
                response = llm.invoke(prompt)
                report_markdown = response.content
            except Exception as e:
                logger.error(f"LLM call failed in Report Generation node: {e}")
                report_markdown = ""
                
        if not report_markdown:
            # Markdown reporting fallback template
            mitigation_bullets = "\n".join([f"- {step}" for step in mitigations])
            
            report_markdown = f"""# AI-Generated Incident Triage Report
**Generated on:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
**Reporter ID:** SOC-MAS-ANALYST

---

## 1. Executive Summary
On {datetime.utcnow().strftime('%Y-%m-%d')}, an automated network intrusion alert was evaluated by the Multi-Agent SOC system. The threat has been identified as **{classification.get('type')}** with **{classification.get('severity').upper()}** severity. The target port is Port **{iocs.get('dest_port')}**. Immediate mitigation is recommended.

## 2. Technical Investigation Narrative
{summary}

## 3. Indicators of Compromise (IoCs)
| Field | Value |
|---|---|
| Attacking Source IP | {iocs.get('source_ip')} |
| Target Destination IP | {iocs.get('dest_ip')} |
| Source Port | {iocs.get('source_port')} |
| Destination Port | {iocs.get('dest_port')} |
| Transport Protocol | {iocs.get('protocol')} |
| Flow Duration (ms) | {iocs.get('flow_duration')} |
| Confidence Score | {classification.get('confidence', 1.0) * 100:.1f}% |

## 4. Mitigation Playbook
Please execute the following containment actions immediately:
{mitigation_bullets}
"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": "Report Generation Agent",
            "action": "Write Incident Report",
            "message": "Incident Report successfully generated and logged."
        }
        
        agent_logs = state.get("agent_logs", [])
        agent_logs.append(log_entry)
        
        return {
            **state,
            "final_report": report_markdown,
            "agent_logs": agent_logs,
            "current_agent": "Report Generation Agent"
        }
