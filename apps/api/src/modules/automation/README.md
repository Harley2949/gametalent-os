# 自动化规则引擎使用指南

## 概述

自动化规则引擎负责自动执行招聘流程中的重复性任务，例如：状态自动推进、通知发送、任务创建等。

## 核心方法

### `checkRules(applicationId: string)`

检查并执行适用于指定申请的所有自动化规则。

**端点**: `POST /api/automation/check/:applicationId`

**工作流程**:
1. 获取申请详情（包含当前状态、候选人、职位）
2. 查询所有适用的自动化规则（`isActive: true` 且适用于该职位）
3. 对每条规则评估触发条件
4. 如果条件满足，执行规则动作
5. 记录执行日志

## 规则结构

```typescript
{
  name: "面试通过后自动推进到 Offer 阶段",
  description: "当面试状态为 INTERVIEWING 且评分 >= 80 时，自动推进到 OFFERED",
  isActive: true,
  ruleType: "AUTO_ADVANCE",
  triggerCondition: {
    type: "STATUS_IN",  // 触发条件类型
    value: ["INTERVIEWING"]  // 状态列表
  },
  actions: [
    {
      type: "UPDATE_STATUS",  // 动作类型
      params: {
        toStatus: "OFFERED"  // 目标状态
      }
    },
    {
      type: "SEND_NOTIFICATION",
      params: {
        recipients: ["hr@example.com", "hiring-manager@example.com"],
        message: "候选人面试已通过，已自动推进到 Offer 阶段"
      }
    }
  ],
  appliesToJobs: []  // 空数组表示适用于所有职位
}
```

## 支持的触发条件类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `STATUS_EQUALS` | 申请状态等于指定值 | `{ type: "STATUS_EQUALS", value: "INTERVIEWING" }` |
| `STATUS_IN` | 申请状态在指定列表中 | `{ type: "STATUS_IN", value: ["INTERVIEWING", "SHORTLISTED"] }` |
| `FIELD_EQUALS` | 指定字段等于指定值 | `{ type: "FIELD_EQUALS", field: "screeningScore", value: 90 }` |
| `SCORE_THRESHOLD` | 匹配分数达到阈值 | `{ type: "SCORE_THRESHOLD", value: 80 }` |
| `TIME_IN_STATUS_GREATER_THAN` | 在当前状态停留超过指定时间（毫秒） | `{ type: "TIME_IN_STATUS_GREATER_THAN", value: 604800000 }` |

## 支持的动作类型

| 类型 | 说明 | 参数 |
|------|------|------|
| `UPDATE_STATUS` | 更新申请状态 | `toStatus` (目标状态) |
| `SEND_NOTIFICATION` | 发送站内通知（模拟） | `recipients` (收件人列表), `message` (消息) |
| `SEND_EMAIL` | 发送邮件（模拟） | `to` (收件人), `subject` (主题), `template` (模板) |
| `CREATE_TASK` | 创建任务（模拟） | `assignee` (负责人), `title` (标题), `description` (描述) |
| `LOG_NOTE` | 记录内部备注（模拟） | `note` (备注内容), `category` (分类) |

## 使用示例

### 示例 1: 面试通过自动推进

```bash
POST /api/automation/check/clm1234567890abc
```

**预期输出** (console.log):
```
========================================
📢 发送通知
========================================
时间: 2026-03-06T12:47:05.123Z
收件人: hr@example.com, hiring-manager@example.com
候选人: 张三
职位: Unity 高级开发工程师
申请状态: INTERVIEWING
消息内容: 候选人面试已通过，已自动推进到 Offer 阶段
========================================
```

**API 响应**:
```json
{
  "success": true,
  "message": "规则检查完成，匹配 1 条，执行 1 条",
  "applicationId": "clm1234567890abc",
  "totalRules": 5,
  "rulesMatched": 1,
  "rulesExecuted": 1,
  "details": [
    {
      "ruleId": "clr1234567890abc",
      "ruleName": "面试通过后自动推进到 Offer 阶段",
      "matched": true,
      "executed": true,
      "message": "规则执行成功",
      "actions": [
        {
          "type": "UPDATE_STATUS",
          "success": true,
          "message": "状态已从 INTERVIEWING 更新为 OFFERED"
        },
        {
          "type": "SEND_NOTIFICATION",
          "success": true,
          "message": "已发送通知给 hr@example.com, hiring-manager@example.com"
        }
      ]
    }
  ]
}
```

### 示例 2: 创建自动化规则

```bash
POST /api/automation/rules
Content-Type: application/json

{
  "name": "超时自动提醒",
  "description": "申请在筛选阶段超过 7 天自动提醒 HR",
  "isActive": true,
  "ruleType": "TIMEOUT_REMINDER",
  "triggerCondition": {
    "type": "TIME_IN_STATUS_GREATER_THAN",
    "value": 604800000
  },
  "actions": [
    {
      "type": "SEND_NOTIFICATION",
      "params": {
        "recipients": ["hr@example.com"],
        "message": "申请 clm1234567890abc 已在 SCREENING 状态超过 7 天，请及时处理"
      }
    }
  ],
  "appliesToJobs": []
}
```

## 最佳实践

1. **规则命名**: 使用清晰、描述性的名称，例如 "面试通过后自动推进到 Offer 阶段"
2. **动作顺序**: 动作按数组顺序执行，重要的动作放在前面
3. **错误处理**: 单个动作失败不会影响其他动作执行
4. **日志记录**: 所有规则执行都会记录到 `ProcessLog` 表，便于追溯
5. **测试**: 在生产环境使用前，先在测试环境验证规则逻辑

## 注意事项

- ⚠️ 当前所有通知和邮件发送使用 `console.log` 模拟，实际生产环境需要对接真实服务
- ⚠️ 规则执行是同步的，复杂规则可能影响性能
- ⚠️ 请确保规则的触发条件和动作参数正确，避免无限循环

## 下一步开发

- [ ] 对接真实邮件服务（SendGrid/阿里云邮件）
- [ ] 对接站内通知系统
- [ ] 对接任务管理系统
- [ ] 添加规则执行异步队列
- [ ] 添加规则执行历史查询和回滚功能
