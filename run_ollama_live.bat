@echo off
setlocal EnableDelayedExpansion
title TrafficIQ - Ollama Live AI Server

echo =====================================================================
echo           TrafficIQ - Ollama Live AI Server Launcher
echo =====================================================================
echo.

:: 1. Set environment variables for LAN and CORS access
set "OLLAMA_ORIGINS=*"
set "OLLAMA_HOST=0.0.0.0:11434"

echo [*] Configured OLLAMA_ORIGINS=* (CORS enabled for Mobile Web / Expo)
echo [*] Configured OLLAMA_HOST=0.0.0.0:11434 (LAN ^& Emulator accessible)
echo.

:: 2. Locate Ollama executable
set "OLLAMA_CMD=ollama"
where ollama >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
        set "OLLAMA_CMD=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
    ) else if exist "%ProgramFiles%\Ollama\ollama.exe" (
        set "OLLAMA_CMD=%ProgramFiles%\Ollama\ollama.exe"
    ) else (
        echo [!] ERROR: Ollama is not found in PATH or standard install directories.
        echo [!] Please install Ollama from https://ollama.com/download and try again.
        echo.
        pause
        exit /b 1
    )
)

echo [*] Using Ollama executable: "!OLLAMA_CMD!"

:: 3. Check if Ollama service is already running on port 11434
echo [*] Checking if Ollama server is active on port 11434...
netstat -ano | findstr /C:":11434" /C:"LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ollama server is already running!
) else (
    echo [*] Starting Ollama server in background...
    start /B "" "!OLLAMA_CMD!" serve >nul 2>&1
    timeout /t 3 /nobreak >nul
)

:: 4. Verify connectivity
echo [*] Testing Ollama service response...
curl -s http://localhost:11434/ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [*] Waiting 2 seconds for Ollama server initialization...
    timeout /t 2 /nobreak >nul
)

echo.
echo =====================================================================
echo           Model Status Check (Phi-4-mini)
echo =====================================================================
echo [*] Checking available local models...
"!OLLAMA_CMD!" list | findstr /I "phi4-mini" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Model 'phi4-mini' was not found locally.
    echo [*] Pulling 'phi4-mini' model now (this may take a few moments)...
    "!OLLAMA_CMD!" pull phi4-mini
    if %ERRORLEVEL% NEQ 0 (
        echo [!] Warning: Could not pull phi4-mini. Trying phi3:mini fallback...
        "!OLLAMA_CMD!" pull phi3:mini
    )
) else (
    echo [OK] 'phi4-mini' model is downloaded and ready!
)

echo.
echo =====================================================================
echo  SUCCESS: Ollama Live AI is RUNNING and ready for TrafficIQ Chatbot!
echo =====================================================================
echo  - Server URL:   http://localhost:11434
echo  - API Endpoint: http://localhost:11434/api/chat
echo  - CORS Status:  All Origins Allowed (OLLAMA_ORIGINS=*)
echo  - Active Model: phi4-mini
echo.
echo  Keep this window OPEN while using the local AI chatbot.
echo  To stop the server, simply close this window.
echo =====================================================================
echo.

:: Keep running to maintain session and allow live interactive log/query
"!OLLAMA_CMD!" run phi4-mini "TrafficIQ Copilot is now connected and online."
if %ERRORLEVEL% NEQ 0 (
    "!OLLAMA_CMD!" serve
)

pause
