# GitHub 仓库设置指南

## 📋 步骤 1: 在 GitHub 上创建仓库

### 选项 A: 通过 GitHub Web 界面创建

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `gametalent-os` 或你喜欢的名称
   - **Description**: `AI-Native Recruitment System for Gaming Industry`
   - **Visibility**: Private（私有）或 Public（公开）
   - **⚠️ 不要**初始化 README、.gitignore 或 license
3. 点击 "Create repository"

### 选项 B: 使用 GitHub CLI（如果已安装）

```bash
# 安装 GitHub CLI（如果还没有）
# Windows: winget install GitHub.cli
# Mac: brew install gh

# 登录 GitHub
gh auth login

# 创建仓库
gh repo create gametalent-os --public --source=. --remote=origin --push
```

---

## 🚀 步骤 2: 连接本地仓库到 GitHub

### 创建完仓库后，运行以下命令：

```bash
# 进入项目目录
cd "C:\Users\admin\resume-analyzer\AI原生招聘系统-claude"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/gametalent-os.git

# 或者使用 SSH（推荐，如果你已配置 SSH 密钥）
git remote add origin git@github.com:YOUR_USERNAME/gametalent-os.git

# 验证远程仓库
git remote -v
```

---

## 📤 步骤 3: 推送代码到 GitHub

```bash
# 推送 main/master 分支
git push -u origin master

# 如果你的默认分支是 main
git push -u origin main
```

---

## ⚙️ 步骤 4: 配置 GitHub Secrets（重要）

推送代码后，需要配置以下 Secrets 才能让 CI/CD 正常运行：

### 必需的 Secrets

1. 访问 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret** 添加以下 secrets：

#### 基础配置
```
名称: DATABASE_URL
值: postgresql://user:password@host:5432/database

名称: JWT_SECRET
值: your-jwt-secret-key

名称: ENCRYPTION_KEY
值: your-encryption-key
```

#### 可选配置（用于生产部署）
```
名称: PRODUCTION_HOST
值: your-server.com

名称: PRODUCTION_USER
值: your-ssh-user

名称: PRODUCTION_SSH_KEY
值: -----BEGIN OPENSSH PRIVATE KEY-----
       ... your private key content ...
       -----END OPENSSH PRIVATE KEY-----
```

---

## ✅ 步骤 5: 验证 CI/CD 运行

### 查看 CI 状态

1. 访问你的 GitHub 仓库
2. 点击 **Actions** 标签页
3. 你应该看到 "CI" workflow 正在运行
4. 点击进入查看详细日志

### 预期结果

CI 管道会依次执行：
- ✅ Lint & Type Check
- ✅ Unit Tests
- ✅ Build
- ✅ E2E Tests
- ✅ Security Scan
- ✅ Dependency Check

**第一次运行可能需要 5-10 分钟**（安装依赖、缓存等）

---

## 🐛 常见问题

### 问题 1: 推送失败 - Authentication Error

**错误信息**：
```
fatal: Authentication failed for 'https://github.com/...'
```

**解决方案**：
```bash
# 使用 GitHub Personal Access Token
# 1. 访问 https://github.com/settings/tokens
# 2. 生成新的 token (repo 权限)
# 3. 使用 token 代替密码

git push
# Username: YOUR_GITHUB_USERNAME
# Password: YOUR_PERSONAL_ACCESS_TOKEN
```

### 问题 2: CI 失败 - permission denied

**错误信息**：
```
Error: Resource not accessible by integration
```

**解决方案**：
1. 进入仓库 Settings → Actions → General
2. 滚动到 "Workflow permissions"
3. 选择 "Read and write permissions"
4. 点击 Save

### 问题 3: GitHub Secrets 未配置

**错误信息**：
```
Error: DATABASE_URL is not set
```

**解决方案**：
按照"步骤 4"配置必需的 GitHub Secrets

---

## 📊 监控 CI 进度

### 使用 GitHub CLI 实时查看

```bash
# 安装 GitHub CLI（如果还没有）
# 然后运行：

# 查看最近的 workflow runs
gh run list --limit 5

# 实时查看最新的 run
gh run watch

# 查看特定 run 的详细日志
gh run view <run-id> --log
```

### 使用 Web 界面

1. 访问仓库的 Actions 页面
2. 点击正在运行或最近的 workflow
3. 查看各个 job 的状态和日志

---

## 🎯 成功标志

当一切正常运行时，你会看到：

1. ✅ 所有 CI jobs 显示绿色勾
2. ✅ 构建产物（artifacts）已生成
3. ✅ 代码覆盖率报告可用
4. ✅ 安全扫描报告已上传

---

## 📞 需要帮助？

如果遇到问题：

1. 查看 [CI_CD_TESTING_GUIDE.md](CI_CD_TESTING_GUIDE.md)
2. 检查 GitHub Actions 日志
3. 查看本文档的"常见问题"部分

**准备好后，告诉我你的 GitHub 用户名，我可以帮你生成完整的推送命令！** 🚀
