# TrafficIQ Unified Multi-Service Local Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   🚀 Launching TrafficIQ Full Stack Development Suite    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$WorkspaceRoot = (Get-Item -Path ".").FullName

Write-Host "[1/3] Starting Backend API Server on http://localhost:8005..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot'; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8005 --reload"

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Frontend Web App on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot'; npm --prefix frontend run dev"

Start-Sleep -Seconds 1

Write-Host "[3/3] Starting Mobile Web Cockpit on http://localhost:5174..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot'; npm --prefix mobile run dev"

Write-Host ""
Write-Host "✅ All services launched in separate windows!" -ForegroundColor Green
Write-Host "• Backend API:      http://localhost:8005/docs"
Write-Host "• Frontend Web:     http://localhost:5173"
Write-Host "• Mobile Cockpit:   http://localhost:5174"
Write-Host "==========================================================" -ForegroundColor Cyan
