@echo off
title CampusXplore Dev Runner
echo ===================================================
echo Starting CampusXplore Services (Backend + Frontend)
echo ===================================================

echo [1/3] Ensuring PostgreSQL Service is running...
net start postgresql-x64-18 >nul 2>&1

echo [2/3] Launching Django Backend (Port 8000)...
start "CampusXplore Backend (Django)" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"

echo [3/3] Launching Vite Frontend (Port 5173)...
start "CampusXplore Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo CampusXplore is launching!
echo Frontend: http://localhost:5173/
echo Backend:  http://127.0.0.1:8000/
echo Admin:    http://127.0.0.1:8000/admin/
echo Credentials: admin@lpu.in / admin123
echo ===================================================
timeout /t 5
