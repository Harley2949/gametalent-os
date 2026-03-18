# 自动化规则引擎测试指南

## 前提条件

确保以下服务正在运行：
- PostgreSQL 数据库（localhost:5433）
- 后端 API 服务（localhost:3001）

---

## 第一步：运行种子数据脚本

### 方法 1：使用 pnpm（推荐）

```bash
cd C:\Users\admin\resume-analyzer\AI原生招聘系统-claude
pnpm --filter @gametalent/db seed
```

### 方法 2：使用 npx

```bash
cd C:\Users\admin\resume-analyzer\AI原生招聘系统-claude\packages\db
npx tsx prisma/seed.ts
```

### 预期输出

```
🌱 开始创建种子数据...

1️⃣  创建测试用户...
   ✅ 用户创建成功: 测试 HR (test@gametalent.com)

2️⃣  创建测试职位...
   ✅ 职位创建成功: Unity 高级开发工程师 (ID: clm123...)

3️⃣  创建测试候选人...
   ✅ 候选人创建成功: 张三 (zhangsan@example.com)

4️⃣  创建测试申请...
   ✅ 申请创建成功: clmabc123... (状态: INTERVIEWING)

5️⃣  创建自动化规则...
   ✅ 规则创建成功: 面试通过后自动推进到 Offer 阶段 (ID: clr456...)

========================================
🎉 种子数据创建完成！
========================================

📋 测试数据信息:
   用户: 测试 HR (test@gametalent.com)
   职位: Unity 高级开发工程师 (ID: clm123...)
   候选人: 张三 (zhangsan@example.com)
   申请: clmabc123... (状态: INTERVIEWING)
   规则: 面试通过后自动推进到 Offer 阶段

🔗 API 测试端点:
   POST http://localhost:3001/api/automation/check/clmabc123...

💡 测试步骤:
   1. 先将申请状态从 INTERVIEWING 改为 INTERVIEW_PASSED
   2. 然后调用 /api/automation/check/:id 接口
   3. 观察规则自动执行和通知输出

✨ 完成！
```

**重要**: 记下输出的 `申请 ID`，后续测试会用到！

---

## 第二步：启动后端 API 服务

```bash
cd C:\Users\admin\resume-analyzer\AI原生招聘系统-claude\apps\api
npm run start:dev
```

等待服务启动完成，看到：
```
✓ Starting Nest application...
✓ Nest application successfully started
```

---

## 第三步：测试自动化规则

### 准备工作

从种子数据输出中复制你的 **申请 ID**，例如：`clmabc123xyz456`

### 测试步骤 1：更新申请状态

我们需要先将申请状态改为 `INTERVIEW_PASSED`，以触发规则。

**使用 curl:**

```bash
curl -X PUT http://localhost:3001/api/applications/{你的申请ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "INTERVIEW_PASSED"
  }'
```

**使用 PowerShell:**

```powershell
$headers = @{
  "Content-Type" = "application/json"
  "Authorization" = "Bearer YOUR_JWT_TOKEN"
}

$body = @{
  status = "INTERVIEW_PASSED"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/applications/{你的申请ID}" `
  -Method PUT -Headers $headers -Body $body
```

**暂时跳过认证（仅测试）:**

如果还没有 JWT token，可以暂时修改 `applications.controller.ts` 移除 `@UseGuards(JwtAuthGuard)`：

```typescript
@Put(':id')
// @UseGuards(JwtAuthGuard)  // 暂时注释掉
@ApiBearerAuth()
async update(@Param('id') id: string, @Body() data: any) {
  return this.applicationsService.update(id, data);
}
```

### 测试步骤 2：调用自动化规则检查接口

**使用 curl:**

```bash
curl -X POST http://localhost:3001/api/automation/check/{你的申请ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**使用 PowerShell:**

```powershell
$headers = @{
  "Content-Type" = "application/json"
  "Authorization" = "Bearer YOUR_JWT_TOKEN"
}

Invoke-RestMethod -Uri "http://localhost:3001/api/automation/check/{你的申请ID}" `
  -Method POST -Headers $headers
```

### 预期输出

#### 1. Console 输出（后端终端）

```
========================================
📢 发送通知
========================================
时间: 2026-03-06T12:47:05.123Z
收件人: test@gametalent.com, hiring-manager@gametalent.com
候选人: 张三
职位: Unity 高级开发工程师
申请状态: INTERVIEW_PASSED
消息内容: 候选人面试已通过，已自动推进到 Offer 阶段，请及时处理薪资谈判
========================================

========================================
📧 发送邮件
========================================
时间: 2026-03-06T12:47:05.456Z
收件人: test@gametalent.com
主题: 面试通过通知 - 张三 (Unity 高级开发工程师)
模板: INTERVIEW_PASSED_TEMPLATE
候选人: 张三
职位: Unity 高级开发工程师
========================================
```

#### 2. API 响应（JSON）

```json
{
  "success": true,
  "message": "规则检查完成，匹配 1 条，执行 1 条",
  "applicationId": "clmabc123xyz456",
  "totalRules": 1,
  "rulesMatched": 1,
  "rulesExecuted": 1,
  "details": [
    {
      "ruleId": "clr456def789...",
      "ruleName": "面试通过后自动推进到 Offer 阶段",
      "matched": true,
      "executed": true,
      "message": "规则执行成功",
      "actions": [
        {
          "type": "UPDATE_STATUS",
          "success": true,
          "message": "状态已从 INTERVIEW_PASSED 更新为 OFFERED"
        },
        {
          "type": "SEND_NOTIFICATION",
          "success": true,
          "message": "已发送通知给 test@gametalent.com, hiring-manager@gametalent.com"
        },
        {
          "type": "SEND_EMAIL",
          "success": true,
          "message": "已发送邮件至 test@gametalent.com"
        }
      ]
    }
  ]
}
```

---

## 验证结果

### 1. 检查申请状态是否已更新

```bash
curl http://localhost:3001/api/applications/{你的申请ID} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

预期：`status` 字段应该是 `"OFFERED"`

### 2. 检查流程日志

```bash
curl http://localhost:3001/api/automation/logs?applicationId={你的申请ID} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

预期：应该看到一条 `changeType: "AUTO"` 的日志记录

### 3. 使用 Prisma Studio 查看数据

```bash
cd C:\Users\admin\resume-analyzer\AI原生招聘系统-claude
pnpm --filter @gametalent/db studio
```

在浏览器中打开：
1. 查看 `applications` 表 - 状态应该变为 `OFFERED`
2. 查看 `process_logs` 表 - 应该有新的日志记录

---

## 故障排查

### 问题 1: 申请不存在

**错误**: `申请不存在: clmxxx`

**解决**:
- 确认已运行种子数据脚本
- 检查申请 ID 是否正确

### 问题 2: 规则未触发

**错误**: `没有适用的规则` 或 `规则检查完成，匹配 0 条`

**解决**:
- 确认申请状态是 `INTERVIEW_PASSED`
- 检查规则是否创建成功：`http://localhost:3001/api/automation/rules`
- 确认规则 `isActive` 为 `true`

### 问题 3: 认证失败

**错误**: `401 Unauthorized`

**解决**:
- 先登录获取 token：`POST /api/auth/login`
- 或暂时注释掉 `@UseGuards(JwtAuthGuard)` 进行测试

### 问题 4: 数据库连接失败

**错误**: `Can't reach database server`

**解决**:
- 确认 PostgreSQL 正在运行（端口 5433）
- 检查 `.env` 文件中的 `DATABASE_URL`

---

## 测试完成后

### 清理测试数据

```bash
# 使用 Prisma Studio 手动删除
pnpm --filter @gametalent/db studio

# 或运行清理脚本（TODO: 创建清理脚本）
```

### 重置数据库

```bash
cd C:\Users\admin\resume-analyzer\AI原生招聘系统-claude
pnpm --filter @gametalent/db reset
```

⚠️ **警告**: 这会删除所有数据！

---

## 下一步

测试通过后，你可以：
1. 创建更多自动化规则
2. 测试不同的触发条件
3. 继续开发任务 #15（权限管理体系）

有问题？查看 `apps/api/src/modules/automation/README.md` 获取更多文档。
