import os
import json
from pathlib import Path
from langchain_core.documents import Document
from typing import List

def load_json_intel_file(file_path: str, category: str) -> List[Document]:
    """
    Load threat intelligence feed stored in structured JSON.
    Assumes array of dictionaries containing a text body and identifier keys.
    """
    documents = []
    p = Path(file_path)
    if not p.exists():
        return []
        
    with open(p, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Check if JSON is list or dictionary
    items = data if isinstance(data, list) else data.get("techniques", data.get("cves", []))
    
    for item in items:
        # Construct content
        title = item.get("name", item.get("id", "Unknown"))
        description = item.get("description", item.get("summary", ""))
        mitigation = item.get("mitigation", "")
        
        text_content = f"Title: {title}\nCategory: {category}\nDescription: {description}\nMitigation: {mitigation}"
        
        metadata = {
            "source": str(p.name),
            "category": category,
            "id": item.get("id", "N/A"),
            "mitre_tactic": item.get("tactic", "N/A")
        }
        documents.append(Document(page_content=text_content, metadata=metadata))
        
    return documents

def load_markdown_playbook(file_path: str, category: str = "playbook") -> List[Document]:
    """
    Load standard markdown file representing a SOC incident playbook.
    """
    documents = []
    p = Path(file_path)
    if not p.exists():
        return []
        
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()
        
    metadata = {
        "source": str(p.name),
        "category": category
    }
    documents.append(Document(page_content=content, metadata=metadata))
    return documents
