@echo off
REM GameTalent OS - 安全检查脚本 (Windows)
REM
REM 在 Git commit 前运行，防止意外提交敏感信息

setlocal enabledelayedexpansion

echo.
echo 🔒 GameTalent OS - 安全检查
echo ========================================

set HAS_VIOLATIONS=false

REM 1. 检查暂存区中的敏感文件
echo.
echo 检查暂存区中的敏感文件...

for /f "delims=" %%f in ('git diff --cached --name-only --diff-filter=ACM 2^>nul') do (
    echo %%f | findstr /R /C:"\.env$" /C:"\.env\.local$" /C:"\.pem$" /C:"\.key$" >nul
    if !errorlevel! equ 0 (
        echo ❌ 检测到敏感文件: %%f
        set HAS_VIOLATIONS=true
    )
)

if "%HAS_VIOLATIONS%"=="false" (
    echo ✓ 未检测到敏感文件
)

REM 2. 检查 .gitignore 配置
echo.
echo 检查 .gitignore 配置...

findstr /C:".env" .gitignore >nul
if errorlevel 1 (
    echo ⚠️  .gitignore 中缺少 .env 规则
) else (
    echo ✓ .gitignore 配置正确
)

REM 3. 总结
echo.
echo ========================================

if "%HAS_VIOLATIONS%"=="true" (
    echo ❌ 安全检查失败！
    echo.
    echo 请执行以下操作：
    echo 1. 将敏感文件从暂存区移除: git reset HEAD ^<file^>
    echo 2. 将敏感文件添加到 .gitignore
    echo 3. 确认不会泄露敏感信息
    echo.
    exit /b 1
)

echo ✓ 安全检查通过！
echo.

endlocal
