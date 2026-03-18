@echo off
REM GameTalent OS - 安全设置一键配置脚本
REM
REM 自动配置环境变量安全管理

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   🔐 GameTalent OS - 安全设置
echo ========================================
echo.

REM 1. 检查当前环境
echo [1/5] 检查当前环境配置...
echo.

if exist .env (
    echo ⚠️  发现现有 .env 文件
    echo    建议备份后重新生成
    copy .env .env.backup >nul
    echo    ✓ 已备份到 .env.backup
    echo.
)

if exist .env (
    findstr /C:"SMTP_PASS" .env | findstr /C:"XdzLJ8YC1AArTz5p" >nul
    if !errorlevel! equ 0 (
        echo 🔴 检测到暴露的 SMTP 密码！
        echo    请立即更新 SMTP_PASS
        echo.
    )
)

findstr /C:"JWT_SECRET" .env | findstr /C:"change" >nul
if !errorlevel! equ 0 (
    echo 🔴 检测到弱 JWT 密钥！
    echo    请立即更新 JWT_SECRET
    echo.
)

REM 2. 生成安全密钥
echo [2/5] 生成安全密钥...
echo.

echo 运行密钥生成器...
echo.

REM 检查是否安装了 ts-node
where ts-node >nul 2>&1
if errorlevel 1 (
    echo ❌ 未安装 ts-node
    echo    请运行: npm install -g ts-node
    echo.
    echo    或手动生成密钥:
    echo    - JWT: openssl rand -hex 32
    echo    - DB: openssl rand -base64 24
    echo.
    pause
    exit /b 1
)

npx ts-node scripts/generate-secrets.ts --all

echo.
echo ✓ 密钥生成完成
echo.

REM 3. 更新 .gitignore
echo [3/5] 更新 .gitignore 配置...
echo.

findstr /C:".env.local" .gitignore >nul
if errorlevel 1 (
    echo 添加环境变量文件到 .gitignore...
    echo .env.local >> .gitignore
    echo .env.development.local >> .gitignore
    echo .env.test.local >> .gitignore
    echo .env.production.local >> .gitignore
    echo secrets/ >> .gitignore
    echo *.pem >> .gitignore
    echo *.key >> .gitignore
    echo ✓ .gitignore 已更新
    echo.
) else (
    echo ✓ .gitignore 配置已存在
    echo.
)

REM 4. 设置 Git Hooks
echo [4/5] 配置 Git 安全检查...
echo.

if not exist .git\hooks (
    echo ❌ 未找到 Git hooks 目录
    echo    请确认当前目录是 Git 仓库
    echo.
    pause
    exit /b 1
)

echo 创建 pre-commit hook...
echo #!/bin/sh > .git\hooks\pre-commit
echo bash scripts/security-check.sh >> .git\hooks\pre-commit

REM Windows 使用 .bat 文件
echo @echo off > .git\hooks\pre-commit.bat
echo call scripts/security-check.bat >> .git\hooks\pre-commit.bat
echo if errorlevel 1 exit /b 1 >> .git\hooks\pre-commit.bat

echo ✓ Git hooks 已配置
echo.

REM 5. 验证配置
echo [5/5] 验证安全配置...
echo.

echo 检查是否存在敏感文件...
if exist .env.local (
    echo ⚠️  发现 .env.local（不会提交到 Git）
)
if exist secrets (
    echo ⚠️  发现 secrets/ 目录
)

echo.
echo ========================================
echo   ✅ 安全设置完成！
echo ========================================
echo.
echo 下一步操作:
echo.
echo 1. 将生成的密钥填入 .env 文件
echo 2. 运行应用测试: npm run dev
echo 3. 提交代码时会自动进行安全检查
echo.
echo ⚠️  重要提示:
echo   - 不要将 .env 文件提交到 Git
echo   - 生产环境使用密钥管理服务
echo   - 定期轮换密钥（每 90 天）
echo.
echo 详细文档: docs/环境变量安全管理指南.md
echo.

pause
