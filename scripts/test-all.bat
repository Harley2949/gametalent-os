@echo off
REM GameTalent OS - 全量测试脚本 (Windows)
REM
REM 使用方法:
REM   test-all.bat                  # 运行所有测试
REM   test-all.bat --coverage       # 生成覆盖率报告
REM   test-all.bat --e2e            # 包含 E2E 测试

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   GameTalent OS - 测试套件
echo ========================================
echo.

REM 解析参数
set COVERAGE=false
set E2E=false

if "%1"=="--coverage" set COVERAGE=true
if "%1"=="--e2e" set E2E=true

REM 1. 后端测试
echo [1/3] 运行后端测试...
echo.
cd apps/api
if "%COVERAGE%"=="true" (
    npm run test:cov
) else (
    npm run test
)
if errorlevel 1 (
    echo.
    echo ❌ 后端测试失败
    exit /b 1
)
cd ../..
echo ✅ 后端测试通过
echo.

REM 2. 前端测试
echo [2/3] 运行前端测试...
echo.
cd apps/web
if "%COVERAGE%"=="true" (
    npm run test:coverage
) else (
    npm run test
)
if errorlevel 1 (
    echo.
    echo ❌ 前端测试失败
    exit /b 1
)
cd ../..
echo ✅ 前端测试通过
echo.

REM 3. E2E 测试（可选）
if "%E2E%"=="true" (
    echo [3/3] 运行 E2E 测试...
    echo.
    npx playwright test
    if errorlevel 1 (
        echo.
        echo ❌ E2E 测试失败
        exit /b 1
    )
    echo ✅ E2E 测试通过
    echo.
)

REM 4. 生成报告
if "%COVERAGE%"=="true" (
    echo ========================================
    echo   测试报告已生成
    echo ========================================
    echo.
    echo 后端覆盖率: apps/api\coverage\index.html
    echo 前端覆盖率: apps/web\coverage\index.html
    echo E2E 报告: playwright-report\index.html
    echo.
)

echo.
echo ========================================
echo   🎉 所有测试通过！
echo ========================================
echo.

endlocal
