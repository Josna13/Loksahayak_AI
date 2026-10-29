@echo off
title LOKORITHM Smart Governance Prototype Launcher
echo ==============================================================
echo   LOKORITHM - AI-Powered Citizen Services & Smart Governance
echo   Seva Innovation Challenge 2026 - Women Category
echo ==============================================================
echo.

echo [1/3] Initializing SQLite Demonstration Database...
python backend\database.py
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Python database init encountered an issue. Proceeding with frontend.
)

echo.
echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000...
start cmd /k "title LOKORITHM Backend && uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo [3/3] Starting Vite Frontend on http://localhost:5173...
start cmd /k "title LOKORITHM Frontend && cd frontend && npm run dev"

echo.
echo ==============================================================
echo   Prototype running!
echo   Frontend: http://localhost:5173
echo   Backend API: http://127.0.0.1:8000/docs
echo ==============================================================
pause
