@echo off
title TrafficIQ - Public Secure AI Tunnel (4G/5G Mobile Remote)

echo =====================================================================
echo       🌐 TrafficIQ - Public Secure AI Tunnel for Mobile
echo =====================================================================
echo.
echo  This tool creates a secure public HTTPS URL for your laptop's AI.
echo  It allows your downloaded mobile app to connect to local Phi-4-mini
echo  from ANYWHERE in the world over 4G/5G mobile data without same Wi-Fi!
echo.
echo =====================================================================
echo.
echo [*] Starting secure tunnel on Port 8005...
echo [*] Copy the 'url' shown below into your Phone App:
echo     Open App -> Profile -> Remote Laptop URL -> Paste & Save
echo.
echo =====================================================================
echo.

call npx -y localtunnel --port 8005

pause
