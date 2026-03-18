@echo off
echo ================================================
echo GameTalent OS - Development Startup
echo ================================================
echo.

echo Step 1: Starting PostgreSQL on port 5433...
set PATH=C:\Program Files\PostgreSQL\17\bin;%PATH%
pg_ctl status -D C:\Users\admin\postgres_data >nul 2>&1
if errorlevel 1 (
    echo Starting PostgreSQL...
    pg_ctl start -D C:\Users\admin\postgres_data -l C:\Users\admin\postgres_data\logfile
    timeout /t 3 >nul
)

echo PostgreSQL is running on port 5433
echo.

echo Step 2: Frontend URL will be http://localhost:3000
echo Step 3: Backend URL will be http://localhost:3001
echo Step 4: API Docs at http://localhost:3001/api/docs
echo.

echo Default Credentials:
echo   Admin: admin@gametalent.os / admin123
echo   Recruiter: recruiter@gametalent.os / recruiter123
echo.

echo ================================================
echo Ready to start servers!
echo ================================================
echo.

echo To start FRONTEND (Next.js):
echo   cd apps\web
echo   npm run dev
echo.

echo To start BACKEND (NestJS):
echo   cd apps\api
echo   set DATABASE_URL=postgresql://gametalent:gametalent_password@localhost:5433/gametalent_os
echo   npm run start:dev
echo.

pause
