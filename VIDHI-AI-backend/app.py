import os
import uvicorn
from fastapi import FastAPI, Request
from src.graphs.graph_builder import GraphBuilder
from src.llms.groqllm import GroqLLM
from src.vectorstore.faiss_store import FaissVectorStore
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


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


@app.get("/health")
async def health():
    groq_configured = bool(os.getenv("GROQ_API_KEY"))
    return {"status": "ok", "groq_configured": groq_configured}



@app.post("/judgement")
async def give_judgement(request: Request):
    data = await request.json()
    case_text = data.get("case_text", "")

    if not case_text:
        return {"error": "case_text is required"}

    state = {"raw_case_file": case_text}

    try:
        current_graph = get_graph()
        result = current_graph.invoke(state)
    except Exception as exc:
        error = str(exc)
        if "Request too large" in error or "rate_limit" in error:
            return {
                "error": "Groq free-tier token limit reached",
                "detail": "Wait one minute, shorten the case text, or upgrade Groq to Dev Tier.",
            }
        return {
            "error": "Courtroom analysis failed",
            "detail": error,
        }

    # If LangGraph HITL interrupt (rare)
    if "__interrupt__" in result:
        partial = current_graph.get_state().value
        return {
            "prosecution": partial.get("prosecution_argument"),
            "defense": partial.get("defense_argument"),
            "verdict": partial.get("final_verdict")
        }

    # Normal output
    return {
        "prosecution": result.get("prosecution_argument"),
        "defense": result.get("defense_argument"),
        "verdict": result.get("final_verdict")
    }


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)