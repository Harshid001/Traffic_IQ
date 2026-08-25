@echo off
title TrafficIQ - Android Standalone APK Builder

echo =====================================================================
echo       📱 TrafficIQ - Standalone Android APK Builder (EAS Cloud)
echo =====================================================================
echo.
echo  This tool builds a standalone .apk installer that anyone can install
echo  directly on any Android phone (no Expo Go, no PC needed).
echo.
echo =====================================================================
echo.

cd /d "%~dp0mobile"

echo [*] Checking EAS CLI...
call npx -y eas-cli --version

echo.
echo [*] Starting Cloud APK Build (Profile: preview / standalone APK)...
echo [*] If prompted, log in to your free Expo account.
echo.

call npx eas-cli build -p android --profile preview

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo   ✅ APK BUILD COMPLETED SUCCESSFULLY!
    echo =====================================================================
    echo.
    echo   Download the .apk from the URL provided above and share it!
    echo =====================================================================
) else (
    echo.
    echo [!] Build exited or cancelled.
)

echo.
pause
