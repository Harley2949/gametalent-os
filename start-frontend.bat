@echo off
cd /d "%~dp0apps\web"
if not exist "node_modules\" call pnpm install
echo.
echo ========================================
echo   启动前端服务...
echo   地址: http://localhost:3000
echo ========================================
echo.
pnpm dev
pause
