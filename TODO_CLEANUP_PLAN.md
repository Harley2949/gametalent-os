# TODO注释清理计划

**统计时间**: 2026-03-17
**真实TODO数量**: 14个（之前8564是误报）
**分布**: 前端3个，后端11个

---

## 📊 TODO分类统计

### 🔴 前端TODO（3个）

#### 1. `apps/web/src/components/candidates/right-action-panel.tsx`
```typescript
// 第85行：TODO: 调用后端 API 保存沟通记录
// 第106行：TODO: 调用后端 API 添加标签
```
**影响**: 候选人右侧操作面板功能
**优先级**: 🟡 中等
**预计时间**: 2-3小时

#### 2. `apps/web/src/middleware.ts`
```typescript
// 第37行：TODO: 生产环境请取消注释下面的代码
```
**影响**: 生产环境安全配置
**优先级**: 🔴 高（部署前必须处理）
**预计时间**: 30分钟

---

### 🔵 后端TODO（11个）

#### 1. AI模块（2个）
**文件**: `apps/api/src/modules/ai/ai.service.ts`
```typescript
// 第275行：TODO: 实现精确的缓存清除逻辑
// 第288行：TODO: 实现精确的缓存清除逻辑
```
**影响**: AI服务缓存管理
**优先级**: 🟢 低（性能优化）
**预计时间**: 2-3小时

#### 2. 自动化规则引擎（4个）
**文件**: `apps/api/src/modules/automation/rule-engine.service.ts`
```typescript
// 第155行：TODO: 实现字段验证逻辑
// 第190行：TODO: 实现通知发送逻辑
// 第220行：TODO: 实现任务创建逻辑
// 第233行：TODO: 实现提醒发送逻辑
```
**影响**: 自动化规则引擎核心功能
**优先级**: 🟡 中等（影响自动化功能）
**预计时间**: 1-2天

#### 3. 排程模块（4个）
**文件**: `apps/api/src/modules/scheduling/scheduling.service.ts`
```typescript
// 第91行：TODO: Implement with UserAvailability model
// 第111行：TODO: Implement with UserAvailability model
// 第353行：TODO: Implement with InterviewInvitation model
// 第383行：TODO: Implement calendar sync when CalendarIntegration model is ready
```
**影响**: 面试排程功能
**优先级**: 🟡 中等（等待Prisma模型更新）
**预计时间**: 1天（需要先更新Prisma schema）

#### 4. 工作流模块（1个）
**文件**: `apps/api/src/modules/workflow/workflow.service.ts`
```typescript
// 第243行：TODO: 当 Job 表添加 templateId 字段后实现
```
**影响**: 工作流模板功能
**优先级**: 🟢 低（需要数据库schema变更）
**预计时间**: 2-3小时

---

## 🎯 清理优先级

### 立即处理（本周）
1. ✅ **middleware.ts 生产环境配置** - 30分钟
   - 检查代码逻辑
   - 取消注释安全相关代码
   - 测试生产环境配置

### 近期处理（本月）
2. ✅ **候选人操作面板API集成** - 2-3小时
   - 实现沟通记录保存API
   - 实现标签管理API
   - 前后端联调测试

3. ✅ **自动化规则引擎核心逻辑** - 1-2天
   - 实现字段验证
   - 实现通知发送
   - 实现任务创建
   - 实现提醒发送

### 中期处理（下月）
4. ✅ **排程模块实现** - 1天
   - 更新Prisma schema（UserAvailability、InterviewInvitation）
   - 实现排程逻辑
   - 实现日历同步

5. ✅ **工作流模板功能** - 2-3小时
   - 更新Job schema（添加templateId字段）
   - 实现模板关联逻辑

### 长期优化
6. ✅ **AI缓存优化** - 2-3小时
   - 实现精确的缓存清除
   - 添加缓存监控

---

## 📋 实施计划

### Phase 1: 快速修复（1天）
```bash
□ 修复middleware.ts生产环境配置
□ 实现候选人操作面板API集成
□ 测试和验证
```

### Phase 2: 核心功能（1-2天）
```bash
□ 实现自动化规则引擎的4个TODO
□ 编写单元测试
□ 集成测试
```

### Phase 3: 依赖更新（1天）
```bash
□ 更新Prisma schema
□ 运行数据库迁移
□ 实现排程和工作流功能
```

### Phase 4: 性能优化（1天）
```bash
□ 实现AI缓存优化
□ 性能测试
□ 文档更新
```

---

## 🚀 快速开始

### 1. 立即可以做的（不依赖其他功能）

**middleware.ts生产环境配置**:
```typescript
// 检查第37行的TODO
// 确认安全逻辑后取消注释
// 测试生产环境行为
```

**候选人操作面板API**:
```bash
# 检查是否存在对应的后端API
curl http://localhost:3006/api/communication
curl http://localhost:3006/api/tags

# 如果不存在，需要先创建API端点
```

### 2. 需要数据库schema更新的功能

**排程模块**需要:
- UserAvailability 模型
- InterviewInvitation 模型
- CalendarIntegration 模型

**工作流模块**需要:
- Job.templateId 字段

### 3. 核心业务逻辑

**自动化规则引擎**需要:
- 设计规则DSL
- 实现规则解析器
- 实现触发器机制
- 实现动作执行器

---

## 📈 进度跟踪

**总TODO数**: 14
**已完成**: 0
**进行中**: 0
**待处理**: 14

**完成度**: 0%

**目标**: 在2周内完成所有高优先级和中等优先级的TODO

---

## 💡 建议

1. **优先处理生产环境相关TODO**（middleware.ts）
2. **快速完成用户可见功能**（候选人操作面板）
3. **按需实现自动化功能**（根据业务需求）
4. **等待合适时机更新schema**（排程和工作流）
5. **性能优化可以延后**（AI缓存）

---

**创建时间**: 2026-03-17
**下次更新**: 每周五
