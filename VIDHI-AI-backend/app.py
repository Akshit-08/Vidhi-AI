import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()
project_dir = Path(__file__).resolve().parent
for candidate in (project_dir / ".env", project_dir.parent / ".env"):
    if candidate.exists():
        load_dotenv(candidate)

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from src.graphs.graph_builder import GraphBuilder
from src.llms.groqllm import GroqLLM
from src.vectorstore.faiss_store import FaissVectorStore

app = FastAPI(title="Vidhi AI Legal Engine")


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://vidhi-ai-backend-production.up.railway.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------
#  LAZY LOAD ON REQUEST
# ----------------------
_graph = None

def get_graph():
    global _graph
    if _graph is None:
        llm = GroqLLM()
        vector_store = FaissVectorStore("faiss_index")
        _graph = GraphBuilder(llm, vector_store).build()
    return _graph


@app.get("/")
def root():
    return {
        "service": "Vidhi AI Legal Backend",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    groq_configured = bool(os.getenv("GROQ_API_KEY") or os.getenv("GROQ_BACKUP_API_KEY"))
    return {
        "status": "ok",
        "groq_configured": groq_configured,
        "engine": "FastAPI + LangGraph",
    }


@app.post("/judgement")
async def give_judgement(request: Request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON body"})

    case_text = data.get("case_text", "").strip()
    if not case_text:
        return JSONResponse(status_code=400, content={"error": "case_text is required"})

    state = {"raw_case_file": case_text}

    try:
        current_graph = get_graph()
        # Offload synchronous graph execution to threadpool so event loop never hangs
        result = await asyncio.to_thread(current_graph.invoke, state)
    except Exception as exc:
        error = str(exc)
        if "Request too large" in error or "rate_limit" in error or "429" in error:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Groq free-tier token limit reached",
                    "detail": "Wait one minute, shorten the case text, or upgrade Groq to Dev Tier.",
                },
            )
        return JSONResponse(
            status_code=500,
            content={
                "error": "Courtroom analysis failed",
                "detail": error,
            },
        )

    # Check for HITL interrupt state
    if "__interrupt__" in result:
        partial = current_graph.get_state().value
        return {
            "prosecution": partial.get("prosecution_argument"),
            "defense": partial.get("defense_argument"),
            "verdict": partial.get("final_verdict"),
        }

    return {
        "prosecution": result.get("prosecution_argument"),
        "defense": result.get("defense_argument"),
        "verdict": result.get("final_verdict"),
    }


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
