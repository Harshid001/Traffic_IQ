@echo off
setlocal EnableDelayedExpansion
title TrafficIQ - Complete AI System Launcher

echo =====================================================================
echo       🚀 TrafficIQ Complete System Launcher (All-in-One)
echo =====================================================================
echo.
echo  This script will start all 3 services in separate live windows:
echo   [1] Ollama Live AI Engine (phi4-mini with full CORS enabled)
echo   [2] FastAPI Backend Microservices (Port 8005)
echo   [3] TrafficIQ Mobile Cockpit App (Expo / Web)
echo.
echo =====================================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: -------------------------------------------------------------
:: 1. Launch Ollama Live AI Server
:: -------------------------------------------------------------
echo [*] [1/3] Launching Ollama Live AI Engine...
set "OLLAMA_CMD=ollama"
where ollama >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
        set "OLLAMA_CMD=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
    ) else if exist "%ProgramFiles%\Ollama\ollama.exe" (
        set "OLLAMA_CMD=%ProgramFiles%\Ollama\ollama.exe"
    )
)

start "TrafficIQ - [1] Ollama AI Engine (phi4-mini)" cmd /k "title TrafficIQ - [1] Ollama AI Engine && set OLLAMA_ORIGINS=*&& set OLLAMA_HOST=0.0.0.0:11434&& echo ======================================================= && echo  TrafficIQ Ollama AI Server (phi4-mini) && echo ======================================================= && echo [*] Checking model phi4-mini... && "!OLLAMA_CMD!" list | findstr /I "phi4-mini" >nul 2>&1 || "!OLLAMA_CMD!" pull phi4-mini && netstat -ano | findstr /R /C:":11434 .*LISTENING" >nul 2>&1 && (echo. && echo [OK] Ollama is active on port 11434 with model phi4-mini! && echo [OK] TrafficIQ AI Copilot queries are connected and live.) || (echo [*] Starting live Ollama server... && "!OLLAMA_CMD!" serve)"

timeout /t 3 /nobreak >nul

:: -------------------------------------------------------------
:: 2. Launch FastAPI Backend Server
:: -------------------------------------------------------------
echo [*] [2/3] Launching FastAPI Backend Server on http://localhost:8005...
where adb >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    adb reverse tcp:8005 tcp:8005 >nul 2>&1
    adb reverse tcp:11434 tcp:11434 >nul 2>&1
    adb reverse tcp:8081 tcp:8081 >nul 2>&1
    echo [OK] Configured ADB reverse tunnels for connected Android devices (ports 8005, 11434, 8081).
)
start "TrafficIQ - [2] FastAPI Backend (Port 8005)" cmd /k "title TrafficIQ - [2] FastAPI Backend && cd /d "%ROOT_DIR%" && echo ======================================================= && echo  TrafficIQ FastAPI Backend Server && echo ======================================================= && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8005 --reload"

timeout /t 2 /nobreak >nul

:: -------------------------------------------------------------
:: 3. Launch Mobile Cockpit Frontend
:: -------------------------------------------------------------
echo [*] [3/3] Launching Mobile Frontend App...
start "TrafficIQ - [3] Mobile Cockpit (Expo / Web)" cmd /k "title TrafficIQ - [3] Mobile Cockpit && cd /d "%ROOT_DIR%" && echo ======================================================= && echo  TrafficIQ Mobile Cockpit App && echo ======================================================= && npm --prefix mobile start"

echo.
echo =====================================================================
echo   ✅ ALL TRAFFICIQ SERVICES ARE NOW RUNNING LIVE!
echo =====================================================================
echo.
echo   • Mobile Cockpit:     Expo Dev Server (Check Window [3])
echo   • Backend API Docs:   http://localhost:8005/docs
echo   • Ollama Live AI:     http://localhost:11434 (phi4-mini)
echo.
echo   You can chat with TrafficIQ Copilot directly inside the app.
echo   All telemetry, AI reasoning, and routes are fully connected!
echo.
echo =====================================================================
echo.
echo Press any key to exit this master launcher window (services keep running).
pause >nul
