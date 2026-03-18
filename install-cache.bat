@echo off
REM AI 服务缓存优化 - 依赖安装脚本
echo ========================================
echo 安装缓存模块依赖...
echo ========================================
echo.

cd apps/api

echo [1/2] 安装 @nestjs/cache-manager...
call pnpm add @nestjs/cache-manager cache-manager
if %errorlevel% neq 0 (
    echo ERROR: 安装失败！
    pause
    exit /b 1
)

echo.
echo [2/2] 安装完成！
echo.
echo ========================================
echo 依赖安装成功！
echo ========================================
echo.
echo 下一步：
echo 1. 启动后端服务: cd apps/api && npm run dev:tsnode
echo 2. 运行测试: npm run test ai.cache.spec.ts
echo 3. 查看文档: docs/AI服务缓存优化-2026-03-12.md
echo.
pause
