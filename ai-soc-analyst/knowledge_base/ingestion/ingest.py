import os
import logging
from pathlib import Path
from langchain_community.vectorstores import Chroma
from knowledge_base.ingestion.loader import load_json_intel_file, load_markdown_playbook
from knowledge_base.ingestion.chunker import split_documents
from knowledge_base.ingestion.embedder import get_embedding_model
from backend.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def run_ingestion():
    # Setup paths
    base_dir = Path("d:/Sem 7 project/ai-soc-analyst/knowledge_base/data")
    mitre_dir = base_dir / "mitre_attack"
    cve_dir = base_dir / "cve_feeds"
    playbook_dir = base_dir / "playbooks"
    
    # Ensure directories exist
    mitre_dir.mkdir(parents=True, exist_ok=True)
    cve_dir.mkdir(parents=True, exist_ok=True)
    playbook_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Load documents
    raw_docs = []
    
    # MITRE ATT&CK Loader
    for f in mitre_dir.glob("*.json"):
        logger.info(f"Loading MITRE technique file: {f}")
        raw_docs.extend(load_json_intel_file(str(f), "mitre_attack"))
        
    # CVE database Loader
    for f in cve_dir.glob("*.json"):
        logger.info(f"Loading CVE file: {f}")
        raw_docs.extend(load_json_intel_file(str(f), "cve_feeds"))
        
    # Playbooks Loader
    for f in playbook_dir.glob("*.md"):
        logger.info(f"Loading playbook file: {f}")
        raw_docs.extend(load_markdown_playbook(str(f), "playbook"))
        
    if not raw_docs:
        logger.warning(
            "No raw documents found to ingest. Make sure JSON techniques, "
            "CVEs, and MD playbooks are present under: "
            "knowledge_base/data/ (mitre_attack/, cve_feeds/, playbooks/)"
        )
        return
        
    # 2. Chunk documents
    logger.info(f"Loaded {len(raw_docs)} documents. Splitting into chunks...")
    chunks = split_documents(raw_docs)
    logger.info(f"Created {len(chunks)} text chunks.")
    
    # 3. Embedding and Indexing into Chroma DB
    embedding_model = get_embedding_model()
    persist_dir = settings.CHROMA_PERSIST_DIR
    
    logger.info(f"Persisting vector store index in ChromaDB at {persist_dir}...")
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory=persist_dir
    )
    
    logger.info("Ingestion complete. Chroma DB updated and persisted.")
    return vector_store

if __name__ == "__main__":
    run_ingestion()
