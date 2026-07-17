# Cybersecurity RAG System Design

This module implements the Retrieval-Augmented Generation (RAG) system, providing a local knowledge base of cyber threat intelligence (MITRE ATT&CK, CVE advisories, NIST frameworks, and incident response playbooks) to ground the Multi-Agent System (MAS).

## System Architecture

```
[Raw Intelligence Docs] (JSON / MD)
           │
           ▼
 [Ingestion Pipeline (ingest.py)]
           │
           ▼
 [Recursive Character Splitter] (chunk_size=1000, overlap=200)
           │
           ▼
 [Embedding Model (all-MiniLM-L6-v2)]
           │
           ▼
   [ChromaDB Collection]
           ▲
           │ (Vector Search Query)
           ▼
[Threat Intel RAG Agent] ──(Augmented Context)──► [Gemini LLM] ──► [Structured Response]
```

### 1. Chunking Strategy
Raw files are processed using LangChain's `RecursiveCharacterTextSplitter`.
- **Chunk Size: 1000 characters.** This keeps complete threat techniques, exploit steps, and playbook descriptions intact. Small chunks lose technical relationships, while larger chunks dilute vector similarity search matches.
- **Overlap: 200 characters.** Ensures boundary identifiers (such as specific CVE ids like `CVE-2021-44228` or attack tool names like `FTP-Patator`) are not broken at the chunk borders, allowing semantic links to remain searchable.

### 2. Embedding Model
We use the **`all-MiniLM-L6-v2`** model from HuggingFace. It maps paragraphs to a 384-dimensional dense vector space. 
- Optimized for cosine similarity searches.
- Highly performant under standard CPU execution, yielding retrieval times under 100ms.

### 3. Vector Database
We use **ChromaDB** as our persistent vector database.
- SQLite-backed local directory persistence, requiring no heavy client-server setups.
- Supports document and metadata-based filtering, allowing the Agent to search specifically within `mitre_attack` or `soc_playbooks` collections depending on the inquiry type.

### 4. Retriever
The retriever queries ChromaDB using **Cosine Similarity**:
\[ \text{Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} \]
For a given query (e.g., "Mitigate HTTP DDoS Hulk attack"), the retriever embeds the string and fetches the top 3 most similar document chunks, including metadata fields for source tracking.

### 5. Prompting & Answer Generation
The `Threat Intelligence RAG Agent` formats retrieved contexts into a structured prompt for Gemini:
```
System Prompt: You are a Tier-2 SOC Analyst. Review the threat query using ONLY the verified retrieved context below. Do not assume or hallucinate features.
Context: {retrieved_chunks}
Query: {threat_query}
Format: Markdown report containing Attack Signature, Severity Level, and Containment Playbook.
```
This forces Gemini to generate factual responses that strictly reflect verified playbooks and CVE descriptions.
