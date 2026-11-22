Write-Host "Starting VIDHI AI Backend and Frontend..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\VIDHI-AI-backend'; python -m uvicorn app:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\VIDHI-AI-frontend'; npm run dev"

Write-Host "Both services launched in separate windows!" -ForegroundColor Green
