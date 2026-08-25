@echo off
title TrafficIQ - Auto Setup & Launch

echo =====================================================================
echo       🚀 TrafficIQ - Complete Auto-Setup & Launch
echo =====================================================================
echo.
echo [*] Checking Python dependencies...
python -m pip install -q -r backend/requirements.txt >nul 2>&1

echo [*] Checking Frontend dependencies...
if not exist "mobile\node_modules" (
    echo [*] Installing mobile cockpit modules...
    call npm --prefix mobile install
)

echo.
echo [*] Starting TrafficIQ System...
call start_all.bat
