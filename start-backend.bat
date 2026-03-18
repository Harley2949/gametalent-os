@echo off
REM ============================================
REM GameTalent 后端服务启动脚本
REM ============================================

echo.
echo ========================================
echo   GameTalent 后端服务启动器
echo ========================================
echo.

REM 进入API目录
cd /d "%~dp0apps\api"

REM 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo [1/2] 安装依赖...
    call npm install
    echo.
)

REM 检查 .env 文件是否存在
if not exist ".env" (
    echo [WARN] 未找到 .env 文件，正在创建默认配置...
    echo DATABASE_URL=postgresql://gametalent:gametalent_password@localhost:5432/gametalent_os?schema=public > .env
    echo JWT_SECRET=your-secret-key-change-in-production >> .env
    echo PORT=3006 >> .env
    echo NODE_ENV=development >> .env
    echo.
    echo [INFO] 已创建 .env 文件
    echo.
)

echo [2/2] 启动后端服务...
echo.
echo ========================================
echo   服务地址: http://localhost:3006
echo   API 文档: http://localhost:3006/api/docs
echo ========================================
echo.
echo 按 Ctrl+C 停止服务
echo.

REM 启动开发服务器
npm run start:dev

pause
