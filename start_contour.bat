@echo off
title CONTOUR Launcher
echo =========================================================
echo  CONTOUR - Graph-Native Decision Reliability Compiler
echo =========================================================
echo.
echo [1/3] Starting FalkorDB Database...
wsl -u root docker start falkordb
echo.
echo [2/3] Starting FastAPI Backend (Port 8000)...
start "CONTOUR Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
echo.
echo [3/3] Starting React Frontend (Port 5173)...
start "CONTOUR Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo.
echo =========================================================
echo  All services launched in separate windows!
echo  Open your browser to: http://localhost:5173
echo =========================================================
timeout /t 5
start http://localhost:5173
