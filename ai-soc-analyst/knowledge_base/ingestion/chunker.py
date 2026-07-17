from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List

def get_text_splitter() -> RecursiveCharacterTextSplitter:
    """
    Configure and return a text splitter.
    
    RATIONALE FOR CHUNKING STRATEGY:
    - Chunk Size = 1000 characters: Captures complete contextual ideas (e.g., an entire MITRE technique step 
      or a CVE description block) without fragmentation.
    - Chunk Overlap = 200 characters: Ensures boundary definitions (like IP addresses, specific tool names, 
      or CVE IDs) are not split across chunks, preserving structural semantics at overlap seams.
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
        separators=["\n\n", "\n", " ", ""]
    )

def split_documents(documents: List[Document]) -> List[Document]:
    """
    Split a list of LangChain documents into chunks, passing along and 
    enriching metadata (such as category, source, and technique_id).
    """
    splitter = get_text_splitter()
    chunks = splitter.split_documents(documents)
    
    # Optional: clean up text inside chunks or enrich metadata
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = i
        
    return chunks
