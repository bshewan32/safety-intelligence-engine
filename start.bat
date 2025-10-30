@echo off
REM =====================================
REM Safety Intelligence Engine - Portable Start
REM =====================================

REM Resolve the directory of this script
set "APP_DIR=%~dp0"
set "USER_DATA_DIR=%APP_DIR%userdata"

REM Ensure local userdata directory exists
if not exist "%USER_DATA_DIR%" mkdir "%USER_DATA_DIR%"

REM Optional: set log path
set "LOG_FILE=%USER_DATA_DIR%\run.log"

REM Tell Electron to use the portable data path
set ELECTRON_USER_DATA_DIR=%USER_DATA_DIR%

REM Launch the app
echo Starting Safety Intelligence Engine Portable...
echo (Data stored in: %USER_DATA_DIR%) >> "%LOG_FILE%"
cd /d "%APP_DIR%"
npx electron . >> "%LOG_FILE%" 2>&1
