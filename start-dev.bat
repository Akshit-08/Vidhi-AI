@echo off
echo Starting VIDHI AI Backend and Frontend...

start "VIDHI AI - Backend" cmd /k "cd /d %~dp0VIDHI-AI-backend && python -m uvicorn app:app --reload --port 8000"
start "VIDHI AI - Frontend" cmd /k "cd /d %~dp0VIDHI-AI-frontend && npm run dev"

echo Both services launched in separate windows!
