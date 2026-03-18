@echo off
REM 权限系统 (RBAC) 初始化脚本
echo ========================================
echo 权限系统 (RBAC) 初始化
echo ========================================
echo.

REM 检查是否在正确的目录
if not exist "packages\db" (
    echo ERROR: 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo [1/4] 合并 Prisma Schema...
cd packages\db
call npm run schema:merge
if %errorlevel% neq 0 (
    echo ERROR: Schema 合并失败！
    pause
    exit /b 1
)
echo.

echo [2/4] 推送 Schema 到数据库...
call npm run prisma:push
if %errorlevel% neq 0 (
    echo ERROR: Schema 推送失败！
    pause
    exit /b 1
)
echo.

echo [3/4] 生成 Prisma Client...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma Client 生成失败！
    pause
    exit /b 1
)
echo.

echo [4/4] 运行 Seed 脚本（初始化权限、角色和测试用户）...
call npm run prisma:seed
if %errorlevel% neq 0 (
    echo ERROR: Seed 脚本执行失败！
    pause
    exit /b 1
)
echo.

echo ========================================
echo 权限系统初始化完成！
echo ========================================
echo.
echo 测试账户:
echo   - ADMIN:      admin@gametalent.os / admin123
echo   - RECRUITER:  recruiter@gametalent.os / admin123
echo   - INTERVIEWER: interviewer@gametalent.os / admin123
echo.
echo 下一步:
echo   1. 启动后端服务: cd apps/api && npm run dev:tsnode
echo   2. 使用测试账户登录验证权限
echo   3. 查看文档: docs/权限系统RBAC实施-2026-03-12.md
echo.
pause
