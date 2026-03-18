@echo off
cd /d "%~dp0"
echo Starting GameTalent OS API Server...
echo.
npx tsx src/main.ts
