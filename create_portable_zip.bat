@echo off
title TrafficIQ - Package Generator (Portable ZIP)

echo =====================================================================
echo       📦 TrafficIQ Portable Package Generator
echo =====================================================================
echo.
echo [*] Compressing project files into TrafficIQ_Portable_v2.0.zip...
echo [*] Excluding node_modules, cache, and temporary files...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$exclude = @('.git', 'node_modules', '__pycache__', '.expo', '.system_generated', 'TrafficIQ_Portable_v2.0.zip'); Get-ChildItem -Path . -Exclude $exclude | Compress-Archive -DestinationPath .\TrafficIQ_Portable_v2.0.zip -Force -CompressionLevel Optimal"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo   ✅ SUCCESS: TrafficIQ_Portable_v2.0.zip created successfully!
    echo =====================================================================
    echo.
    echo   File location: %~dp0TrafficIQ_Portable_v2.0.zip
    echo.
    echo   You can now email or send this single ZIP file via WhatsApp/Drive!
    echo =====================================================================
) else (
    echo.
    echo [!] Error occurred while creating zip file.
)

echo.
pause
