@echo off
SETLOCAL
TITLE GATE Nexus Launcher

:: Navigate to the script's directory
cd /d "%~dp0"

:: Check if dependencies exist
IF NOT EXIST "node_modules" (
    ECHO [ERROR] Dependencies not found!
    ECHO Please run 'setup.bat' first to install requirements.
    PAUSE
    EXIT /B
)

ECHO ===================================================
ECHO        STARTING GATE NEXUS
ECHO ===================================================
ECHO.
ECHO 1. Starting Local Server (Minimized)...
:: Start npm start in a minimized window with a specific title
start /MIN "GATE Nexus Engine (DO NOT CLOSE)" npm start

ECHO 2. Waiting for server to initialize...
:: Wait 6 seconds for Vite/Express to boot
timeout /t 6 /nobreak >nul

ECHO 3. Launching Application Interface...
:: Open Microsoft Edge in Application Mode (No address bar, native feel)
start msedge --app=http://localhost:5173

ECHO.
ECHO Done! The app is running.
ECHO To stop the app, close the minimized "GATE Nexus Engine" window.
ECHO.
timeout /t 3 >nul
EXIT
