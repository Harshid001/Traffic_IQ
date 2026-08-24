# Start TrafficIQ FastAPI Backend
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting TrafficIQ Backend on Port 8005 " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$env:PORT = "8005"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8005 --reload
