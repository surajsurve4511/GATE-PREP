@echo off
TITLE GATE Prep App - Setup Wizard
CLS

ECHO ===================================================
ECHO      GATE PREP APP - AUTOMATED SETUP
ECHO ===================================================
ECHO.

:: 1. Check Node.js
ECHO [1/5] Checking Node.js installation...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Node.js is not installed or not in PATH.
    ECHO Please install Node.js from https://nodejs.org/ and try again.
    PAUSE
    EXIT /B
)
ECHO Node.js is installed.
ECHO.

:: 2. Configure Database (.env)
ECHO [2/5] Configuring Database Settings...
IF EXIST "server\.env" (
    ECHO server\.env already exists. Skipping configuration.
) ELSE (
    ECHO Creating server\.env file...
    SET /P DB_PASS="Enter your MySQL Root Password (leave empty if none): "
    
    (
        ECHO DB_HOST=localhost
        ECHO DB_USER=root
        ECHO DB_PASSWORD=%DB_PASS%
        ECHO DB_NAME=gate
        ECHO PORT=5000
        ECHO GEMINI_API_KEY=
    ) > server\.env
    
    ECHO server\.env created. 
    ECHO NOTE: If you have a Gemini API Key, please add it to server\.env manually later.
)
ECHO.

:: 3. Install Dependencies
ECHO [3/5] Installing Project Dependencies...
ECHO This ensures all required libraries are installed.
ECHO This may take a few minutes...
ECHO.

ECHO Installing Root dependencies...
call npm install
IF %ERRORLEVEL% NEQ 0 GOTO ERROR

ECHO.
ECHO Installing Client and Server dependencies...
call npm run install-all
IF %ERRORLEVEL% NEQ 0 GOTO ERROR

:: 4. Create Database
ECHO.
ECHO [4/5] Setting up Database...
cd server
node create_db.js
cd ..
IF %ERRORLEVEL% NEQ 0 GOTO ERROR

:: 5. Create Shortcut
ECHO.
ECHO [5/5] Creating Desktop Shortcut...
powershell -ExecutionPolicy Bypass -File create_shortcut.ps1

ECHO.
ECHO ===================================================
ECHO [SUCCESS] SETUP COMPLETE!
ECHO ===================================================
ECHO.
ECHO You can now launch the app using the "GATE Nexus" shortcut in this folder.
ECHO.
PAUSE
EXIT /B

:ERROR
ECHO.
ECHO ===================================================
ECHO ERROR: An error occurred during installation.
ECHO Please check the error messages above.
ECHO ===================================================
PAUSE
