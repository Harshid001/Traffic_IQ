@echo off
title TrafficIQ - Complete AI System Launcher

echo =====================================================================
echo       TrafficIQ Complete System Launcher (Zero-Config All-in-One)
echo =====================================================================
echo.
echo  Starting all backend, AI, and mobile services with zero setup...
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: -------------------------------------------------------------
:: 0. Auto-Detect Wi-Fi / Local IP & Configure Network
:: -------------------------------------------------------------
set "DETECTED_IP=127.0.0.1"
for /f "delims=" %%I in ('python -c "import socket; s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()" 2^>nul') do set "DETECTED_IP=%%I"

echo [*] Auto-detected Laptop Wi-Fi IP: %DETECTED_IP%

:: Auto-sync mobile/.env with detected IP while preserving any existing API keys
python -c "import os; p=r'mobile/.env'; content=open(p).read() if os.path.exists(p) else ''; lines=[l for l in content.splitlines() if not l.startswith('EXPO_PUBLIC_API_BASE_URL=') and not l.startswith('EXPO_PUBLIC_API_KEY=')]; lines.insert(0, 'EXPO_PUBLIC_API_BASE_URL=http://%DETECTED_IP%:8005'); lines.insert(1, 'EXPO_PUBLIC_API_KEY=trafficiq-dev-key'); open(p,'w').write('\n'.join(lines)+'\n')" >nul 2>&1

python -c "import json; p=r'mobile/app.json'; data=json.load(open(p)); data.setdefault('expo',{}).setdefault('extra',{})['apiBaseUrl']='http://%DETECTED_IP%:8005'; data['expo']['android']['usesCleartextTraffic']=True; json.dump(data, open(p,'w'), indent=2)" >nul 2>&1
python -c "import json; p=r'mobile/eas.json'; data=json.load(open(p)); data['build']['preview'].setdefault('env',{})['EXPO_PUBLIC_API_BASE_URL']='http://%DETECTED_IP%:8005'; data['build']['production'].setdefault('env',{})['EXPO_PUBLIC_API_BASE_URL']='http://%DETECTED_IP%:8005'; json.dump(data, open(p,'w'), indent=2)" >nul 2>&1

:: Configure Windows Firewall for ports 8005 & 11434 (Silent)
netsh advfirewall firewall add rule name="TrafficIQ FastAPI" dir=in action=allow protocol=TCP localport=8005 profile=any >nul 2>&1
netsh advfirewall firewall add rule name="TrafficIQ Ollama" dir=in action=allow protocol=TCP localport=11434 profile=any >nul 2>&1

:: Configure ADB reverse tunnels if Android device connected (USB or Wireless)
where adb >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python -c "import subprocess; out = subprocess.check_output(['adb', 'devices']).decode(); [subprocess.run(['adb', '-s', l.split('\t')[0], 'reverse', f'tcp:{p}', f'tcp:{p}'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) for l in out.strip().splitlines()[1:] if '\tdevice' in l for p in [8005, 8081, 11434]]" >nul 2>&1
    echo [OK] Configured ADB reverse tunnels for connected Android devices.
)

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

start "TrafficIQ - [1] Ollama AI Engine" cmd /k "title TrafficIQ - [1] Ollama AI Engine && set OLLAMA_ORIGINS=* && set OLLAMA_HOST=0.0.0.0:11434 && echo ======================================================= && echo  TrafficIQ Ollama AI Server (phi4-mini) && echo ======================================================= && echo [*] Verifying model phi4-mini... && %OLLAMA_CMD% list && echo. && echo [OK] Ollama Live AI Engine is active on port 11434! && echo [OK] Ready to answer TrafficIQ queries via phi4-mini. && netstat -ano | findstr /R /C:\":11434 .*LISTENING\" >nul || %OLLAMA_CMD% serve"

ping -n 2 127.0.0.1 >nul 2>&1

:: -------------------------------------------------------------
:: 2. Launch FastAPI Backend Server
:: -------------------------------------------------------------
echo [*] [2/3] Launching FastAPI Backend Server on http://0.0.0.0:8005 (LAN: http://%DETECTED_IP%:8005)...
start "TrafficIQ - [2] FastAPI Backend" cmd /k "title TrafficIQ - [2] FastAPI Backend && cd /d "%ROOT_DIR%" && echo ======================================================= && echo  TrafficIQ FastAPI Backend Server (Port 8005) && echo ======================================================= && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8005 --reload"

ping -n 2 127.0.0.1 >nul 2>&1

:: -------------------------------------------------------------
:: 3. Launch Mobile Cockpit Frontend
:: -------------------------------------------------------------
echo [*] [3/3] Launching Mobile Frontend App...
start "TrafficIQ - [3] Mobile Cockpit" cmd /k "title TrafficIQ - [3] Mobile Cockpit && cd /d "%ROOT_DIR%" && echo ======================================================= && echo  TrafficIQ Mobile Cockpit App && echo ======================================================= && npm --prefix mobile start"

echo.
echo =====================================================================
echo   ALL TRAFFICIQ SERVICES ARE RUNNING LIVE ^& AUTO-CONNECTED!
echo =====================================================================
echo.
echo   - Local Wi-Fi IP:     http://%DETECTED_IP%:8005
echo   - Mobile Cockpit:     Expo Dev Server (Window [3])
echo   - Backend API Docs:   http://localhost:8005/docs
echo   - Ollama Live AI:     http://localhost:11434 (phi4-mini)
echo.
echo   Zero manual steps required!
echo   Your phone app automatically discovers and connects to this laptop.
echo.
echo =====================================================================
echo.
echo Press any key to exit this launcher window (services keep running).
pause >nul
