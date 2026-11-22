# VIDHI AI - Multi-Agent RAG-Based Courtroom

VIDHI AI is an autonomous, multi-agent legal intelligence platform designed to analyze criminal cases against the Indian Penal Code (IPC). It simulates an adversarial courtroom proceeding featuring dedicated Prosecution and Defense agents, followed by synthesis and judicial determination by an AI Judge Agent grounded in a FAISS vector database.

---

## 🏛️ System Architecture

- **Ingestion & Embedding**: Case facts, police reports, and FIR details are parsed and embedded.
- **RAG Retrieval Engine**: Queries relevant Indian Penal Code (IPC) statutory provisions via FAISS vector store.
- **Adversarial Agents**:
  - **⚖️ Prosecution Agent**: Formulates formal charges, establishes evidence linking the accused, and argues culpability beyond reasonable doubt.
  - **🛡️ Defense Agent**: Rebuts the prosecution's claims, exposes evidentiary contradictions, highlights absence of *mens rea*, and argues reasonable doubt.
- **👨‍⚖️ Judicial Bench (Judge Agent)**: Synthesizes both arguments, assesses evidence against statutory requirements, frames findings, and renders the final judgment with sentencing or acquittal orders.

---

## 📂 Repository Structure

```
Vidhi-AI/
├── VIDHI-AI-backend/          # FastAPI & LangGraph Multi-Agent Backend
│   ├── faiss_index/           # Pre-indexed IPC legal database
│   ├── src/
│   │   ├── agents/            # Agent prompts & logic
│   │   ├── graphs/            # LangGraph workflow orchestration
│   │   ├── llms/              # Groq LLM integration
│   │   ├── nodes/             # Prosecution, Defense, & Judge nodes
│   │   └── vectorstore/       # FAISS vector store retriever
│   ├── app.py                 # FastAPI REST API server
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Backend environment template
│
├── VIDHI-AI-frontend/         # Next.js 16 & React 19 Frontend
│   ├── app/
│   │   ├── components/        # LegalContentRenderer & UI components
│   │   ├── page.tsx           # Courtroom Chamber & Results UI
│   │   └── layout.tsx         # Root layout & courtroom metadata
│   ├── package.json           # Frontend dependencies (Tailwind v4, Lucide)
│   └── .env.example           # Frontend environment template
│
├── start-dev.bat              # One-click Windows runner (starts both servers)
├── start-dev.ps1              # PowerShell runner
└── README.md                  # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** & npm
- **Groq API Key** ([console.groq.com](https://console.groq.com))

---

### Setup & Installation

#### 1. Backend Setup

```bash
cd VIDHI-AI-backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env
```

Open `.env` and configure your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b
GROQ_MAX_TOKENS=1200
```

#### 2. Frontend Setup

```bash
cd ../VIDHI-AI-frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env.local
```

Ensure `.env.local` contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### Running Both Servers

#### Option A: Quick Launcher (Windows)
Double-click `start-dev.bat` or run:
```cmd
.\start-dev.bat
```

#### Option B: Manual Terminals

* **Terminal 1 (Backend):**
  ```bash
  cd VIDHI-AI-backend
  python -m uvicorn app:app --reload --port 8000
  ```

* **Terminal 2 (Frontend):**
  ```bash
  cd VIDHI-AI-frontend
  npm run dev
  ```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📜 Disclaimer

VIDHI AI is an academic and research project demonstrating multi-agent adversarial reasoning over legal statutes. Outputs are for informational purposes and do not constitute formal legal counsel.
