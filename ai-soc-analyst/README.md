# AI-Powered SOC Analyst

A Multi-Agent Security Operations Center Assistant built as a 6-credit undergraduate project.

## Project Overview

This system uses Machine Learning to detect network intrusions from the CICIDS2017 dataset and a Multi-Agent System (LangGraph + Gemini API) with RAG (ChromaDB) to investigate threats and generate incident reports.

## Technology Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS
- React Router
- Axios
- Recharts

### Backend
- FastAPI
- SQLAlchemy (SQLite for development)
- Pydantic

### AI (Sprint 2+)
- LangGraph
- LangChain
- Google Gemini API
- ChromaDB

### Machine Learning (Sprint 2+)
- XGBoost
- Pandas
- Scikit-learn

### Dataset
- CICIDS2017

## Project Structure

```
ai-soc-analyst/
├── backend/            # FastAPI server
│   ├── api/            # Route handlers
│   ├── core/           # Config, logging, error handling
│   ├── db/             # Database engine and session
│   ├── models/         # SQLAlchemy ORM models
│   └── schemas/        # Pydantic request/response schemas
├── frontend/           # React client
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/      # Route-level page components
│       └── api/        # Axios HTTP client
├── ml/                 # ML training pipeline (Sprint 2+)
├── agents/             # LangGraph multi-agent system (Sprint 2+)
└── knowledge_base/     # ChromaDB RAG documents (Sprint 2+)
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Sprint Roadmap

| Sprint | Deliverables |
|--------|-------------|
| Sprint 1 | Project skeleton, placeholder APIs, React dashboard |
| Sprint 2 | ML pipeline (CICIDS2017 + XGBoost), CSV upload + inference |
| Sprint 3 | RAG knowledge base, LangGraph multi-agent system |
| Sprint 4 | Full integration, testing, polish |
