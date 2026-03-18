# 自动化规则引擎 - 快速测试指南

## 🚀 三步快速测试

### 1️⃣ 运行种子数据

```bash
cd C:\Users\admin\resume-analyzer\AI原生招聘系统-claude
pnpm --filter @gametalent/db seed
```

**记下输出的申请 ID！** 例如: `clmabc123xyz456`

---

### 2️⃣ 启动后端服务

```bash
cd apps/api
npm run start:dev
```

等待看到: `✓ Nest application successfully started`

---

### 3️⃣ 运行测试脚本

**Windows PowerShell:**
```powershell
cd C:\Users\admin\resume-analyzer\AI原生招聘系统-claude
.\test-automation.ps1
```

**Git Bash:**
```bash
cd C:/Users/admin/resume-analyzer/AI原生招聘系统-claude
chmod +x test-automation.sh
./test-automation.sh
```

---

## 📊 预期结果

### ✅ 后端终端输出

```
========================================
📢 发送通知
========================================
时间: 2026-03-06T12:47:05.123Z
收件人: test@gametalent.com, hiring-manager@gametalent.com
候选人: 张三
职位: Unity 高级开发工程师
申请状态: INTERVIEW_PASSED
消息内容: 候选人面试已通过...
========================================
```

### ✅ API 响应

```json
{
  "success": true,
  "totalRules": 1,
  "rulesMatched": 1,
  "rulesExecuted": 1
}
```

### ✅ 状态变化

`INTERVIEWING` → `INTERVIEW_PASSED` → `OFFERED`

---

## 🛠️ 手动测试（可选）

如果测试脚本无法运行，可以手动执行：

### 步骤 1: 更新状态

```bash
curl -X PUT http://localhost:3001/api/applications/{申请ID} \
  -H "Content-Type: application/json" \
  -d '{"status": "INTERVIEW_PASSED"}'
```

### 步骤 2: 触发规则

```bash
curl -X POST http://localhost:3001/api/automation/check/{申请ID}
```

### 步骤 3: 验证结果

```bash
curl http://localhost:3001/api/applications/{申请ID}
```

检查 `status` 是否为 `"OFFERED"`

---

## 📝 测试数据

种子数据会创建：

| 类型 | 名称 | 描述 |
|------|------|------|
| 用户 | test@gametalent.com | 测试 HR |
| 职位 | Unity 高级开发工程师 | 测试职位 |
| 候选人 | zhangsan@example.com | 张三 |
| 申请 | - | 状态: INTERVIEWING |
| 规则 | 面试通过自动推进 | INTERVIEW_PASSED → OFFERED |

---

## 🔧 故障排查

### 问题: 数据库连接失败

**解决**: 确认 PostgreSQL 运行在 5433 端口

```bash
# 检查 PostgreSQL
docker ps | grep postgres

# 或检查进程
netstat -an | findstr 5433
```

### 问题: 后端启动失败

**解决**: 检查端口 3001 是否被占用

```bash
# Windows
netstat -ano | findstr :3001

# 关闭占用进程
taskkill /PID {进程ID} /F
```

### 问题: 认证失败

**临时解决**: 编辑 `apps/api/src/modules/applications/applications.controller.ts`

```typescript
@Put(':id')
// @UseGuards(JwtAuthGuard)  // 暂时注释
@ApiBearerAuth()
async update(@Param('id') id: string, @Body() data: any) {
  return this.applicationsService.update(id, data);
}
```

---

## ✨ 测试成功标志

- [✓] 种子数据运行成功
- [✓] 后端服务正常启动
- [✓] 状态更新为 `OFFERED`
- [✓] 后端终端显示通知输出
- [✓] `process_logs` 表有新记录

全部勾选？测试通过！🎉

---

## 📖 详细文档

- 完整测试指南: `packages/db/TEST_GUIDE.md`
- 自动化模块文档: `apps/api/src/modules/automation/README.md`
- API 文档: http://localhost:3001/api/docs

---

## 下一步

测试通过后继续开发 **任务 #15: 权限管理体系**
