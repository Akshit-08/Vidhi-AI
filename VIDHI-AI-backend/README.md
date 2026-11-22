# VIDHI AI - Backend Service

FastAPI-powered legal intelligence backend using LangGraph multi-agent workflows and FAISS vector retrieval over the Indian Penal Code (IPC).

## Endpoints

- `GET /health` - Health check status.
- `POST /judgement` - Takes a JSON payload `{"case_text": "..."}` and returns prosecution arguments, defense arguments, and final judicial verdict.
