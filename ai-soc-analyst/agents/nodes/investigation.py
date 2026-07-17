import logging
import json
from datetime import datetime
from agents.graph.state import AgentState
from agents.nodes.orchestrator import get_llm

logger = logging.getLogger(__name__)

class InvestigationNode:
    @staticmethod
    def execute(state: AgentState) -> AgentState:
        logger.info("Executing Investigation Node...")
        
        classification = state.get("attack_classification", {})
        iocs = state.get("extracted_iocs", {})
        threat_context = state.get("threat_context", "")
        
        llm = get_llm()
        summary = ""
        mitigation_list = []
        
        if llm:
            try:
                prompt = (
                    f"You are a Senior Cybersecurity Investigator. Review the incident details:\n"
                    f"1. Verified Attack Type: {classification.get('type')}\n"
                    f"2. Severity: {classification.get('severity')}\n"
                    f"3. Indicators: {json.dumps(iocs)}\n"
                    f"4. Retrieved Threat Intel & Playbooks: {threat_context}\n\n"
                    f"Provide an investigation summary explaining the attack behavior and a list of step-by-step mitigation actions.\n"
                    f"Return response in structured JSON with keys 'summary' (str) and 'mitigation_steps' (list of strings)."
                )
                response = llm.invoke(prompt)
                
                # Simple parser helper for JSON or text fallback
                try:
                    res_content = response.content.strip()
                    # Strip markdown blocks if present
                    if res_content.startswith("```json"):
                        res_content = res_content[7:-3].strip()
                    elif res_content.startswith("```"):
                        res_content = res_content[3:-3].strip()
                    data = json.loads(res_content)
                    summary = data.get("summary", "")
                    mitigation_list = data.get("mitigation_steps", [])
                except Exception:
                    summary = response.content
                    mitigation_list = ["Apply firewall drop rules", "Isolate compromised host"]
            except Exception as e:
                logger.error(f"LLM call failed in Investigation node: {e}")
                summary = "Failed to run LLM investigation. Utilizing pre-built playbooks."
        
        # Fallback if no LLM or if parsing failed
        if not summary:
            # Rule-based fallback summary
            attack_type = classification.get("type", "Anomaly")
            src_ip = iocs.get("source_ip", "attacker")
            dest_port = iocs.get("dest_port", 80)
            
            summary = (
                f"Incident Investigation shows a high-confidence {attack_type} attack targeting "
                f"Port {dest_port}. The attack originated from IP {src_ip}. Ingested threat intelligence "
                f"playbooks confirm this signature matches malicious flooding/brute force patterns."
            )
            
            if "ddos" in attack_type.lower():
                mitigation_list = [
                    "Block attacker IP using firewall drop rules.",
                    "Apply rate limiting limits on public API gateway routers.",
                    "Activate SYN cookie protections at target operating system."
                ]
            elif "brute" in attack_type.lower():
                mitigation_list = [
                    "Isolate Target System IP address from external access.",
                    "Fail2Ban temporary blocking of brute-forcing IP address.",
                    "Audit authentication logs to verify if login was successful."
                ]
            else:
                mitigation_list = [
                    "Analyze destination traffic for payload anomalies.",
                    "Restrict port access to verified source subnet ranges."
                ]
                
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent": "Investigation Agent",
            "action": "Analyze Threat Context",
            "message": f"Compiled incident narrative: {summary[:100]}..."
        }
        
        agent_logs = state.get("agent_logs", [])
        agent_logs.append(log_entry)
        
        return {
            **state,
            "investigation_summary": summary,
            "mitigation_steps": mitigation_list,
            "agent_logs": agent_logs,
            "current_agent": "Investigation Agent"
        }
