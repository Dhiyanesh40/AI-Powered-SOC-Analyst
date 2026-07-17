import os
import logging
from langchain_community.vectorstores import Chroma
from knowledge_base.ingestion.embedder import get_embedding_model
from backend.core.config import settings

logger = logging.getLogger(__name__)

class ThreatIntelRetriever:
    def __init__(self):
        self.vector_store = None
        self.is_active = False
        self.load_vector_store()
        
    def load_vector_store(self) -> None:
        try:
            persist_dir = settings.CHROMA_PERSIST_DIR
            if os.path.exists(persist_dir):
                embeddings = get_embedding_model()
                self.vector_store = Chroma(
                    persist_directory=persist_dir,
                    embedding_function=embeddings
                )
                self.is_active = True
                logger.info(f"RAG ChromaDB successfully connected at {persist_dir}")
            else:
                logger.warning(f"ChromaDB directory not found at {persist_dir}. Running in simulated RAG fallback mode.")
        except Exception as e:
            logger.error(f"Failed to load ChromaDB: {e}. Falling back to simulation.")
            self.is_active = False
            
    def retrieve(self, query: str, k: int = 3) -> str:
        """
        Query the Chroma vector database and compile matching threat intel chunks.
        """
        if not self.is_active or not self.vector_store:
            # Fallback mock threat intelligence data based on keywords
            q = query.lower()
            if "ddos" in q or "dos" in q or "hulk" in q:
                return (
                    "[Source: mitre_attack (T1498)] - Title: Network Denial of Service (DoS)\n"
                    "Description: Adversaries may perform Network Denial of Service (DoS) attacks to disrupt service availability by flooding network resources. Techniques include UDP/SYN Flooding and DDoS Hulk.\n"
                    "Mitigation: Configure firewall rate-limits, SYN cookies, and deploy Web Application Firewalls (WAF) to filter application-layer requests.\n\n"
                    "[Source: playbooks (ddos_response.md)] - Title: DDoS Containment\n"
                    "Steps: Drop traffic from offending source IPs, sysctl -w net.ipv4.tcp_syncookies=1, and enable request limits on Nginx proxies."
                )
            elif "brute" in q or "patator" in q or "ssh" in q or "ftp" in q:
                return (
                    "[Source: mitre_attack (T1110)] - Title: Brute Force\n"
                    "Description: Testing credential combinations against interfaces. Popular vectors include SSH-Patator (Port 22) and FTP-Patator (Port 21).\n"
                    "Mitigation: Implement account lockouts, Fail2Ban rate blocks, and disable password-based authentication.\n\n"
                    "[Source: playbooks (brute_force_response.md)] - Title: SSH containment\n"
                    "Steps: Drop attack source IPs using iptables: iptables -A INPUT -s <attacker_ip> -j DROP, set PasswordAuthentication to no."
                )
            elif "portscan" in q or "discovery" in q or "scan" in q:
                return (
                    "[Source: mitre_attack (T1046)] - Title: Network Service Discovery (PortScan)\n"
                    "Description: Scanning ports to find open ports and versions.\n"
                    "Mitigation: Limit public-facing services, drop scans at firewall, configure IPS policies to block scan rates."
                )
                
            return "No matching verified threat intelligence chunks found in fallback knowledge base."
            
        try:
            # Run similarity search
            results = self.vector_store.similarity_search(query, k=k)
            retrieved_texts = []
            for doc in results:
                src = doc.metadata.get("source", "unknown")
                category = doc.metadata.get("category", "intel")
                retrieved_texts.append(
                    f"[Source: {src} ({category})] - Page Content:\n{doc.page_content}"
                )
            return "\n\n---\n\n".join(retrieved_texts)
        except Exception as e:
            logger.error(f"Error querying ChromaDB: {e}")
            return f"Error retrieving threat intelligence: {str(e)}"
