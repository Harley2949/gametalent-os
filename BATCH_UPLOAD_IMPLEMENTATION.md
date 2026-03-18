# 批量简历上传功能实现说明

## 功能概述

已成功实现真正的批量简历上传功能，用户可以一次性选择多个简历文件进行上传和AI解析，系统会并行处理所有文件并提供详细的成功/失败反馈。

## 主要变更

### 前端组件修改 (`resume-uploader.tsx`)

#### 1. **新增 BatchResult 接口**
```typescript
interface BatchResult {
  fileName: string;
  status: 'success' | 'failed';
  data?: any;
  error?: string;
}
```

#### 2. **重构 uploadFiles 函数为批量上传**

**之前的行为：**
- 逐个上传文件（for循环）
- 每个文件发送单独的请求到 `/api/resume-upload/upload`
- 第一个文件成功后立即跳转到候选人详情页
- 无法真正实现批量处理

**现在的行为：**
- 一次性上传所有文件
- 发送单个请求到 `/api/resume-upload/batch`
- 使用 FormData 包含多个文件
- 等待所有文件处理完成后才跳转
- 显示详细的成功/失败统计

**关键代码：**
```typescript
// 准备批量上传的 FormData
const formData = new FormData();
pendingFiles.forEach(fileItem => {
  formData.append('files', fileItem.file);  // 注意：字段名是 'files'（复数）
});

// 发送到批量上传端点
const response = await fetch('http://localhost:3006/api/resume-upload/batch', {
  method: 'POST',
  body: formData,
  signal: controller.signal,
});
```

#### 3. **增强的错误处理**
- 使用 `Promise.allSettled` 模式（后端已实现）
- 单个文件失败不影响其他文件
- 为每个文件显示具体的错误信息
- 60秒超时控制（批量上传需要更长时间）

#### 4. **改进的用户反馈**

**成功信息：**
- 显示成功/失败数量统计
- 每个成功文件显示解析的候选人信息（姓名、邮箱、技能数）
- Toast 通知：`✅ 批量上传完成！成功 X 个，失败 Y 个`

**失败处理：**
- 每个失败文件显示具体错误原因
- 支持"重试"按钮重新上传失败的文件
- 失败文件可以单独移除

**完成后的操作：**
- 显示汇总信息面板
- 提供"查看候选人列表"按钮
- 提供"上传更多简历"按钮清空列表重新开始

#### 5. **UI 状态显示**

文件状态包括：
- `pending` - 等待上传
- `uploading` - 正在上传
- `parsing` - AI 解析中
- `success` - 上传并解析成功
- `error` - 处理失败

每个状态都有对应的视觉反馈：
- 图标（上传图标、加载动画、成功勾选、错误警告）
- 进度条
- 文本描述

## 后端支持

后端已具备完整的批量上传支持：

### 端点：`POST /api/resume-upload/batch`

**控制器：** `resume-upload.controller.ts` (第58-89行)

**特性：**
- 使用 `FilesInterceptor('files', 10)` 接收最多10个文件
- 使用 `Promise.allSettled` 并行处理所有文件
- 单个文件失败不影响其他文件
- 返回详细的结果数组

**响应格式：**
```json
{
  "success": true,
  "message": "批量上传完成：2 个成功，1 个失败",
  "data": {
    "total": 3,
    "success": 2,
    "failed": 1,
    "results": [
      {
        "fileName": "resume1.pdf",
        "status": "success",
        "data": {
          "candidateId": "...",
          "resumeId": "...",
          "parsedData": { ... }
        }
      },
      {
        "fileName": "resume2.pdf",
        "status": "failed",
        "error": "AI解析超时"
      }
    ]
  }
}
```

## 使用流程

1. **选择文件**
   - 点击上传区域或拖拽文件
   - 支持多选（Ctrl/Cmd + 点击）
   - 文件类型验证：PDF、JPG、PNG
   - 文件大小限制：5MB

2. **上传文件**
   - 点击"上传 X 个文件"按钮
   - 所有文件同时上传到后端
   - 实时显示每个文件的处理状态

3. **查看结果**
   - 成功：显示候选人姓名、邮箱、技能数
   - 失败：显示错误原因，可重试
   - 汇总：显示总数、成功数、失败数

4. **后续操作**
   - 点击"查看候选人列表"查看所有新创建的候选人
   - 或点击"上传更多简历"继续上传

## 技术要点

### 前端
- **React Hooks**: useState、useCallback、useRouter
- **状态管理**: 每个文件独立的状态追踪
- **进度反馈**: 实时更新上传和解析进度
- **错误处理**: 优雅的错误处理和用户提示

### 后端
- **NestJS**: FilesInterceptor 处理多文件上传
- **Multer**: 底层文件上传中间件
- **Promise.allSettled**: 并行处理容错
- **AI 解析**: 复用现有的 Ollama LLM 解析逻辑

### 数据库
- **Prisma ORM**: 事务处理确保数据一致性
- **独立记录**: 每个简历创建独立的 Candidate 和 Resume 记录
- **关联数据**: 自动创建教育、工作经历、项目经历等关联记录

## 优势

1. **真正的批量处理**: 不再是"只能上传第一个文件"
2. **并行处理**: 所有文件同时上传和解析，提高效率
3. **容错性强**: 单个文件失败不影响其他文件
4. **用户友好**: 清晰的状态显示和错误提示
5. **可扩展**: 支持最多10个文件同时上传

## 测试建议

1. **测试批量上传**
   - 选择2-3个有效的PDF简历文件
   - 验证所有文件都被正确处理
   - 检查候选人列表中是否创建了对应的记录

2. **测试错误处理**
   - 混合有效和无效文件（如错误的格式）
   - 验证失败文件不影响成功文件
   - 检查错误信息是否清晰

3. **测试边界情况**
   - 上传10个文件（达到上限）
   - 上传超过5MB的文件
   - 上传不支持的文件格式

## 文件位置

- **前端组件**: `apps/web/src/components/resume-uploader.tsx`
- **后端控制器**: `apps/api/src/modules/resume-upload/resume-upload.controller.ts`
- **后端服务**: `apps/api/src/modules/resume-upload/resume-upload.service.ts`
- **API端点**: `POST http://localhost:3006/api/resume-upload/batch`

## 后续优化建议

1. **进度条优化**: 显示总体上传进度百分比
2. **取消功能**: 允许用户取消正在进行的批量上传
3. **重试全部**: 一键重试所有失败的文件
4. **历史记录**: 保存上传历史供用户查看
5. **拖拽排序**: 允许用户调整文件处理顺序
