@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   GameTalent OS - 后端启动脚本
echo ========================================
echo.

echo [1/3] 清理旧进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3006"') do (
    echo   杀掉进程: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [2/3] 等待端口释放...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] 启动后端服务...
cd /d "%~dp0"
npx ts-node --transpile-only -r tsconfig-paths/register src/main.ts

pause
