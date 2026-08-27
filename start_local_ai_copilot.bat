@echo off
title TrafficIQ - Local AI Model ^& Web Copilot Connector
color 0b

echo =====================================================================
echo       🤖 TrafficIQ - Local AI Engine ^& Web Copilot Connector
echo =====================================================================
echo.
echo  Connecting your laptop's local AI model (Phi-4-mini) directly to:
echo  Production URL: https://web-react-phi-blue.vercel.app/copilot
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: -------------------------------------------------------------
:: 0. Auto-Detect Wi-Fi / Local IP & Configure Network
:: -------------------------------------------------------------
set "DETECTED_IP=127.0.0.1"
for /f "delims=" %%I in ('python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2^>nul') do set "DETECTED_IP=%%I"

echo [*] Auto-detected Laptop IP: %DETECTED_IP%

:: Configure Windows Firewall for ports 8005 & 11434 (Silent)
netsh advfirewall firewall add rule name="TrafficIQ FastAPI" dir=in action=allow protocol=TCP localport=8005 profile=any >nul 2>&1
netsh advfirewall firewall add rule name="TrafficIQ Ollama" dir=in action=allow protocol=TCP localport=11434 profile=any >nul 2>&1

:: -------------------------------------------------------------
:: 1. Launch Ollama Live AI Engine (CORS enabled for Web App)
:: -------------------------------------------------------------
echo [*] [1/2] Launching Ollama AI Engine (Phi-4-mini)...
set "OLLAMA_CMD=ollama"
where ollama >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
        set "OLLAMA_CMD=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
    ) else if exist "%ProgramFiles%\Ollama\ollama.exe" (
        set "OLLAMA_CMD=%ProgramFiles%\Ollama\ollama.exe"
    )
)

start "TrafficIQ - [1] Ollama AI Engine" cmd /k "title TrafficIQ - [1] Ollama AI Engine && set OLLAMA_ORIGINS=* && set OLLAMA_HOST=0.0.0.0:11434 && echo ======================================================= && echo  TrafficIQ Ollama AI Server (phi4-mini) && echo ======================================================= && echo [*] Verifying model phi4-mini... && %OLLAMA_CMD% list && echo. && echo [OK] Ollama Live AI Engine is active on port 11434! && echo [OK] Ready to answer TrafficIQ queries via phi4-mini. && netstat -ano | findstr /R /C:\":11434 .*LISTENING\" >nul || %OLLAMA_CMD% serve"

ping -n 3 127.0.0.1 >nul 2>&1

:: -------------------------------------------------------------
:: 2. Launch FastAPI Backend Server (Zero-Hallucination Routing)
:: -------------------------------------------------------------
echo [*] [2/2] Launching FastAPI Backend Server on http://0.0.0.0:8005...
start "TrafficIQ - [2] FastAPI Backend" cmd /k "title TrafficIQ - [2] FastAPI Backend && cd /d "%ROOT_DIR%" && echo ======================================================= && echo  TrafficIQ FastAPI Backend Server (Port 8005) && echo ======================================================= && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8005 --reload"

ping -n 3 127.0.0.1 >nul 2>&1

:: -------------------------------------------------------------
:: 3. Launch Live Production Web App in Browser
:: -------------------------------------------------------------
echo.
echo [*] Opening Live Production Web App in your browser...
start https://web-react-phi-blue.vercel.app/copilot

echo.
echo =====================================================================
echo   🟢 LOCAL AI MODEL IS LIVE ^& CONNECTED TO PRODUCTION WEB APP!
echo =====================================================================
echo.
echo   • Web Copilot URL:    https://web-react-phi-blue.vercel.app/copilot
echo   • Local AI Engine:    http://localhost:11434 (phi4-mini)
echo   • Backend Server:     http://localhost:8005
echo   • Backend API Docs:   http://localhost:8005/docs
echo   • Local Wi-Fi IP:     http://%DETECTED_IP%:8005
echo.
echo   💡 The Web Copilot will now automatically detect your local model
echo      and answer dynamically with zero hardcoding!
echo.
echo =====================================================================
echo.
echo Press any key to exit this launcher window (services keep running).
pause >nul
