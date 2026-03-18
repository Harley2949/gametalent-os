# CI/CD 测试指南

本文档提供完整的 CI/CD 管道测试和验证步骤。

## 📋 前置条件

### 1. GitHub 仓库设置

确保项目已推送到 GitHub：

```bash
# 添加远程仓库（如果还没有）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送代码
git push -u origin master
```

### 2. GitHub Secrets 配置

在 GitHub 仓库中配置以下 Secrets（Settings → Secrets and variables → Actions）：

**生产环境 Secrets**：
```
DATABASE_URL              # PostgreSQL 数据库连接字符串
STAGING_DATABASE_URL      # 预发布环境数据库连接
PRODUCTION_HOST           # 生产服务器主机地址
PRODUCTION_USER           # SSH 用户名
PRODUCTION_SSH_KEY        # SSH 私钥
JWT_SECRET               # JWT 密钥
ENCRYPTION_KEY           # 加密密钥
```

**服务集成 Secrets**（可选）：
```
SLACK_WEBHOOK            # Slack 通知 Webhook
VERCEL_TOKEN             # Vercel 部署令牌
CODECOV_TOKEN            # Codecov 令牌
```

---

## 🚀 本地测试

### 测试 1: Git Hooks

验证 pre-commit hooks 是否正常工作：

```bash
# 修改一个文件
echo "// test" >> apps/web/src/app/page.tsx

# 尝试提交（应该触发 lint-staged）
git add apps/web/src/app/page.tsx
git commit -m "test: verify git hooks"

# 预期结果：
# - ESLint 自动修复格式问题
# - Prettier 格式化代码
# - 如果有错误，提交会失败
```

### 测试 2: 本地构建

验证代码可以成功构建：

```bash
# 后端构建
cd apps/api
pnpm run build

# 前端构建
cd apps/web
pnpm run build

# 预期结果：
# - 没有构建错误
# - 生成 dist/ 和 .next/ 目录
```

### 测试 3: 本地 E2E 测试

验证 Playwright 测试可以运行：

```bash
# 安装 Playwright 浏览器
npx playwright install --with-deps

# 运行 E2E 测试
cd ../../
pnpm run test:e2e

# 预期结果：
# - 浏览器自动打开
# - 运行测试用例
# - 生成测试报告
```

### 测试 4: 环境变量脚本

测试安全密钥生成脚本：

```bash
# 运行环境变量配置脚本
npx tsx scripts/setup-env.ts

# 预期结果：
# - 生成 .env.local 文件
# - 包含安全的随机密钥
# - 更新 .gitignore
```

---

## 🔍 GitHub Actions CI 测试

### 测试 1: 推送触发 CI

推送代码到 GitHub 触发 CI 管道：

```bash
# 创建一个测试分支
git checkout -b test/ci-pipeline

# 做一个小修改
echo "# CI Test" >> README.md

# 提交并推送
git add README.md
git commit -m "test: trigger CI pipeline"
git push origin test/ci-pipeline

# 预期结果：
# - GitHub Actions 自动启动
# - 运行 Lint、Type Check、测试等任务
```

### 测试 2: 查看 CI 结果

在 GitHub 上查看 CI 运行状态：

1. 访问仓库的 "Actions" 标签页
2. 点击最新的 workflow run
3. 查看各个 job 的执行状态

**预期结果**：
```
✅ Lint & Type Check  - 通过
✅ Unit Tests         - 通过
✅ Build              - 通过
✅ E2E Tests          - 通过
✅ Security Scan      - 通过
✅ Dependency Check   - 通过
```

### 测试 3: 故障排查

如果 CI 失败，检查以下内容：

**Lint 失败**：
```bash
# 本地运行 lint 查看错误
pnpm run lint

# 自动修复
pnpm run lint:fix
```

**测试失败**：
```bash
# 本地运行测试
pnpm run test

# 查看详细输出
pnpm run test -- --verbose
```

**构建失败**：
```bash
# 检查构建日志
pnpm run build

# 常见问题：
# - TypeScript 类型错误
# - 依赖缺失
# - 环境变量未设置
```

---

## 🚢 CD 部署测试

### 测试 1: 手动触发部署

1. 在 GitHub 上进入 "Actions" 标签页
2. 选择 "CD" workflow
3. 点击 "Run workflow"
4. 选择环境（production 或 staging）
5. 点击 "Run workflow"

### 测试 2: 自动部署

推送到 main 分支触发生产部署：

```bash
# 合并测试分支到 main
git checkout master
git merge test/ci-pipeline

# 推送到 main（触发 CD）
git push origin master

# 预期结果：
# - CI 先运行
# - CI 通过后，CD 自动启动
# - 构建并推送 Docker 镜像
# - 部署到服务器
```

### 测试 3: 部署验证

部署完成后验证：

```bash
# 1. 检查应用健康状态
curl https://your-domain.com/health

# 预期响应：
# {"status":"ok","timestamp":"..."}

# 2. 检查 API 端点
curl https://your-domain.com/api/health

# 3. 访问前端
# 打开浏览器访问 https://your-domain.com

# 4. 查看日志（SSH 到服务器）
ssh user@server
docker logs gametalent-os-api-1
docker logs gametalent-os-web-1
```

---

## 🔧 故障排查指南

### CI 失败常见问题

**问题 1: 依赖安装失败**
```
Error: Cannot find module 'xxx'
```

**解决方案**：
```bash
# 本地清理并重新安装
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install

# 提交更新的 lockfile
git add pnpm-lock.yaml
git commit -m "chore: update dependencies"
git push
```

**问题 2: TypeScript 错误**
```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**解决方案**：
```bash
# 本地运行类型检查
pnpm run type-check

# 修复类型错误
# 然后重新提交
```

**问题 3: 测试超时**
```
Error: Test timeout of 30000ms exceeded
```

**解决方案**：
- 增加测试超时时间
- 检查测试是否有死循环
- 优化测试性能

### CD 失败常见问题

**问题 1: Docker 推送失败**
```
Error: failed to push image to registry
```

**解决方案**：
```bash
# 检查 GitHub Packages 权限
# Settings → Actions → General → Workflow permissions
# 确保 "Read and write permissions" 已启用
```

**问题 2: SSH 连接失败**
```
Error: Failed to connect to server
```

**解决方案**：
```bash
# 1. 验证 SSH 密钥格式
cat ~/.ssh/id_rsa | pbcopy  # 复制私钥

# 2. 在 GitHub Secrets 中更新
# PRODUCTION_SSH_KEY

# 3. 测试 SSH 连接
ssh -i ~/.ssh/id_rsa user@server
```

**问题 3: 部署后应用无法访问**
```
Error: 502 Bad Gateway
```

**解决方案**：
```bash
# 1. 检查容器状态
ssh user@server
docker ps -a

# 2. 查看容器日志
docker logs gametalent-os-api-1 --tail 100

# 3. 重启容器
docker-compose restart

# 4. 检查环境变量
docker exec gametalent-os-api-1 env | grep DATABASE
```

---

## 📊 监控和日志

### 查看实时日志

```bash
# API 日志
ssh user@server
docker logs -f gametalent-os-api-1

# Web 日志
docker logs -f gametalent-os-web-1

# 所有容器日志
docker-compose logs -f
```

### 性能监控

访问性能监控仪表盘：
```
https://your-domain.com/analytics/performance
```

查看关键指标：
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)

---

## ✅ 验证清单

使用以下清单验证 CI/CD 设置是否完整：

### CI 管道
- [ ] GitHub Actions workflow 文件已创建
- [ ] 推送代码后 CI 自动触发
- [ ] 所有 CI jobs 通过
- [ ] 测试覆盖率报告生成
- [ ] 安全扫描运行

### CD 管道
- [ ] Docker 镜像成功构建
- [ ] 镜像推送到 Container Registry
- [ ] 部署到服务器成功
- [ ] 健康检查通过
- [ ] Slack 通知发送

### 本地开发
- [ ] Git hooks 正常工作
- [ ] 本地构建成功
- [ ] E2E 测试通过
- [ ] 环境变量脚本正常
- [ ] 代码格式化自动运行

### 监控
- [ ] 性能指标收集
- [ ] 错误追踪集成
- [ ] 日志聚合配置
- [ ] 告警规则设置

---

## 🎯 下一步

完成 CI/CD 验证后：

1. **优化 CI 时间**
   - 启用依赖缓存
   - 并行运行测试
   - 优化 Docker 镜像大小

2. **增强监控**
   - 配置 Sentry 错误追踪
   - 设置性能预算告警
   - 集成 PagerDuty

3. **文档完善**
   - 编写部署手册
   - 创建故障排查指南
   - 记录常见问题

---

## 📞 获取帮助

如果遇到问题：

1. 查看 GitHub Actions 日志
2. 检查本文档的故障排查部分
3. 联系 DevOps 团队

**祝您使用愉快！** 🚀
