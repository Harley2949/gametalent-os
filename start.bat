@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM   GameTalent OS - 一键启动脚本
REM ========================================

REM 设置颜色
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo.
echo %BLUE%=======================================================
echo           GameTalent OS - 系统启动脚本
echo           一键启动前后端服务
echo======================================================%RESET%
echo.

REM 项目路径
set "PROJECT_DIR=C:\Users\admin\resume-analyzer\AI原生招聘系统-claude"
set "BACKEND_DIR=%PROJECT_DIR%\apps\api"
set "FRONTEND_DIR=%PROJECT_DIR%\apps\web"

REM ========================================
REM 步骤 1：检查项目目录
REM ========================================
echo %GREEN%[步骤 1/7] 检查项目目录...%RESET%
echo.

if not exist "%PROJECT_DIR%" (
    echo %RED%❌ 错误：项目目录不存在！%RESET%
    echo.
    echo 项目路径：%PROJECT_DIR%
    echo.
    echo 请检查：
    echo   1. 路径是否正确
    echo   2. 项目文件夹是否被移动或删除
    echo.
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%" (
    echo %RED%❌ 错误：后端目录不存在！%RESET%
    echo.
    echo 后端路径：%BACKEND_DIR%
    echo.
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo %RED%❌ 错误：前端目录不存在！%RESET%
    echo.
    echo 前端路径：%FRONTEND_DIR%
    echo.
    pause
    exit /b 1
)

echo %GREEN%✓ 项目目录检查通过%RESET%
echo   - 后端：%BACKEND_DIR%
echo   - 前端：%FRONTEND_DIR%
echo.

REM ========================================
REM 步骤 2：停止所有Node.js进程
REM ========================================
echo %GREEN%[步骤 2/7] 停止所有Node.js进程...%RESET%
echo.

taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 >nul

REM 检查是否还有Node进程在运行
tasklist | findstr /i "node.exe" >nul 2>&1
if %errorlevel% == 0 (
    echo %YELLOW%⚠️  警告：仍有Node进程在运行，尝试再次停止...%RESET%
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 >nul

    tasklist | findstr /i "node.exe" >nul 2>&1
    if %errorlevel% == 0 (
        echo %RED%❌ 错误：无法停止所有Node进程！%RESET%
        echo.
        echo 请手动操作：
        echo   1. 按 Ctrl+Shift+Esc 打开任务管理器
        echo   2. 找到所有 node.exe 进程
        echo   3. 右键 → 结束任务
        echo.
        pause
        exit /b 1
    )
)

echo %GREEN%✓ 所有Node进程已停止%RESET%
echo.

REM ========================================
REM 步骤 3：清理前端缓存
REM ========================================
echo %GREEN%[步骤 3/7] 清理前端缓存...%RESET%
echo.

if exist "%FRONTEND_DIR%\.next" (
    echo 正在删除 .next 缓存...
    rmdir /s /q "%FRONTEND%\.next" >nul 2>&1
    if exist "%FRONTEND_DIR%\.next" (
        echo %YELLOW%⚠️  警告：缓存删除失败，可能文件被占用%RESET%
        echo   继续尝试启动，但可能会遇到问题...
    ) else (
        echo %GREEN%✓ .next 缓存已删除%RESET%
    )
) else (
    echo %YELLOW%! 未找到.next缓存文件夹（这是正常的）%RESET%
)
echo.

REM ========================================
REM 步骤 4：启动后端服务
REM ========================================
echo %GREEN%[步骤 4/7] 启动后端服务...%RESET%
echo.
echo   - 端口：3006
echo   - 环境：开发模式
echo   - 日志：当前控制台
echo.
echo %YELLOW%正在打开后端窗口...%RESET%
echo.

start "GameTalent-后端-端口3006" cmd /k ^
title GameTalent-Backend-Port3006 ^
color 0A ^@
cd /d "%BACKEND_DIR%" ^(
    echo %BLUE%======================================================= %RESET% ^
    echo %BLUE%           GameTalent OS - 后端服务 %RESET% ^
    echo %BLUE%======================================================= %RESET% ^
    echo. ^
    echo %GREEN%正在启动后端服务...%RESET% ^
    echo. ^
    echo %YELLOW%请等待以下信息：%RESET% ^
    echo   - "Starting Nest application..." ^
    echo   - "Application successfully started" ^
    echo   - "Nest application successfully started" ^
    echo. ^
    echo %RED%如果看到错误，请截图联系开发人员%RESET% ^
    echo %BLUE%======================================================= %RESET% ^
    npx ts-node src/main.ts ^
)

echo %GREEN%✓ 后端窗口已打开%RESET%
echo.

REM ========================================
REM 步骤 5：等待后端启动
REM ========================================
echo %GREEN%[步骤 5/7] 等待后端服务启动...%RESET%
echo.
echo   等待 8 秒让后端完全启动...
echo.

timeout /t 8 >nul

echo %GREEN%✓ 后端等待时间结束%RESET%
echo.

REM ========================================
REM 步骤 6：启动前端服务
REM ========================================
echo %GREEN%[步骤 6/7] 启动前端服务...%RESET%
echo.
echo   - 端口：3000
echo   - 环境：开发模式
echo   - 热更新：已启用
echo.
echo %YELLOW%正在打开前端窗口...%RESET%
echo.

start "GameTalent-前端-端口3000" cmd /k ^
title GameTalent-Frontend-Port3000 ^@
color 0E ^@
cd /d "%FRONTEND_DIR%" ^(
    echo %BLUE%======================================================= %RESET% ^
    echo %BLUE%           GameTalent OS - 前端服务 %RESET% ^
    echo %BLUE%======================================================= %RESET% ^
    echo. ^
    echo %GREEN%正在启动前端服务...%RESET% ^
    echo. ^
    echo %YELLOW%请等待以下信息：%RESET% ^
    echo   - "ready - started server on 0.0.0.0:3000" ^
    echo   - "Ready in Xs" ^
    echo   - "compiled" ^
    echo. ^
    echo %RED%如果看到错误，请截图联系开发人员%RESET% ^
    echo %BLUE%======================================================= %RESET% ^
    npm run dev ^
)

echo %GREEN%✓ 前端窗口已打开%RESET%
echo.

REM ========================================
REM 步骤 7：等待前端启动
REM ========================================
echo %GREEN%[步骤 7/7] 等待前端服务启动...%RESET%
echo.
echo   等待 12秒让前端完全编译...
echo.

timeout /t 12 >nul

echo %GREEN%✓ 前端等待时间结束%RESET%
echo.

REM ========================================
REM 打开浏览器
REM ========================================
echo %GREEN%正在打开浏览器...%RESET%
echo.

start http://localhost:3000/login

echo %GREEN%✓ 浏览器已打开登录页面%RESET%
echo.

REM ========================================
REM 完成提示
REM ========================================
echo.
echo %BLUE%=======================================================%RESET%
echo           %GREEN%✓ 系统启动完成！%RESET%
echo %BLUE%=======================================================%RESET%
echo.
echo.
echo %YELLOW%📋 请检查以下窗口：%RESET%
echo.
echo   1. %GREEN%后端窗口%RESET%（标题：GameTalent-Backend-Port3006）
echo      - 应该看到：Application successfully started
echo.
echo   2. %GREEN%前端窗口%RESET%（标题：GameTalent-Frontend-Port3000）
echo      - 应该看到：Ready in Xs
echo.
echo   3. %GREEN%浏览器窗口%RESET%
echo      - 应该显示登录页面
echo.
echo.
echo %YELLOW%🔐 登录信息：%RESET%
echo.
echo   邮箱：admin@gametalent.com
   密码：admin123
echo.
echo.
echo %YELLOW%📝 测试AI功能：%RESET%
echo.
echo   登录后：
echo   1. 点击左侧菜单 "应聘管理"
echo   2. 点击任意应聘记录
echo   3. 查看AI匹配分数（75分）和详细分析
echo.
echo.
echo %YELLOW%⚠️  重要提示：%RESET%
echo.
echo   - 保持后端和前端窗口打开（不要关闭）
echo   - 如需停止服务，在对应窗口按 Ctrl+C
   - 如需重新启动，双击此批处理文件即可
echo.
echo %BLUE%=======================================================%RESET%
echo.

pause
