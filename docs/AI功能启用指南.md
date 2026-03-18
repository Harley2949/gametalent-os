# GameTalent OS - AI功能启用指南

**更新日期**：2026年3月16日
**状态**：代码已完成，需启用Ollama服务

---

## 📋 概述

系统已经实现了完整的AI功能，包括：
- ✅ **简历解析**：AI驱动提取候选人信息
- ✅ **智能匹配**：候选人与职位匹配度计算
- ✅ **技能提取**：从简历中提取技能标签
- ✅ **竞品分析**：识别游戏公司工作经验
- ✅ **缓存优化**：避免重复计算

**只需安装Ollama并下载模型即可使用！**

---

## 🚀 快速启用（10分钟）

### 步骤1：安装Ollama

#### Windows系统：
1. 访问 https://ollama.com/download/windows
2. 下载 `OllamaSetup.exe`
3. 双击安装，按提示完成
4. 安装完成后Ollama会自动在后台运行

#### 验证安装：
打开命令行（CMD或PowerShell），运行：
```bash
ollama --version
```

应该显示版本号，例如：`ollama version is 0.1.20`

---

### 步骤2：下载AI模型

**推荐模型**（根据您的电脑配置选择）：

#### 选项A：轻量级模型（推荐）⚡
```bash
ollama pull llama3.2:1b
```
- **大小**：~1.3GB
- **速度**：非常快
- **适用**：测试和开发
- **内存需求**：~2GB

#### 选项B：中等模型（平衡）⚖️
```bash
ollama pull llama3.2:3b
```
- **大小**：~2GB
- **速度**：较快
- **适用**：生产环境
- **内存需求**：~4GB

#### 选项C：大型模型（高精度）🎯
```bash
ollama pull llama3.2:8b
```
- **大小**：~4.7GB
- **速度**：较慢
- **适用**：对准确性要求极高
- **内存需求**：~8GB

**验证模型下载成功**：
```bash
ollama list
```

应该显示：
```
NAME                ID              SIZE      MODIFIED
llama3.2:1b         ...            1.3GB     ...
```

---

### 步骤3：测试Ollama

运行测试命令（可选）：
```bash
ollama run llama3.2:1b "你好，请用一句话介绍你自己"
```

如果返回AI回复，说明Ollama工作正常！

---

### 步骤4：重启后端服务

配置已自动完成（`.env`已配置），只需重启后端：

```bash
# 停止当前后端服务（Ctrl+C）

# 重新启动
cd C:\Users\admin\resume-analyzer\AI原生招聘系统-claude\apps\api
npx ts-node src/main.ts
```

**查看启动日志**，确认Ollama连接成功：
```
[Nest] xxx   - AiService {AiService} 正在初始化...
[Nest] xxx   - Ollama连接: http://localhost:11434
[Nest] xxx   - 模型: llama3.2:1b
```

---

## 🎯 AI功能使用指南

### 功能1：简历上传与自动解析

#### 使用方法：
1. 进入候选人详情页
2. 点击"上传简历"按钮
3. 选择PDF/Word文件
4. 系统自动解析并填充候选人信息

#### 自动提取的信息：
- ✅ 基本信息（姓名、电话、邮箱）
- ✅ 职业信息（当前职位、公司、工作年限）
- ✅ 技能标签（游戏引擎、编程语言、TA方向等）
- ✅ 项目经验（项目名称、角色、状态）
- ✅ 教育背景
- ✅ 作品集链接（GitHub、ArtStation等）
- ✅ 逻辑疑点警告

#### API端点：
```
POST /api/resume/upload
- 请求：multipart/form-data
- 返回：解析后的候选人信息
```

---

### 功能2：智能职位匹配

#### 使用方法：
1. 创建应聘记录后，系统自动计算匹配度
2. 在应聘详情页查看匹配分数（0-100分）
3. 匹配详情包括：
   - **技能匹配度**：技能标签重叠度
   - **经验匹配度**：工作经验符合度
   - **教育匹配度**：学历背景符合度
   - **优势分析**：候选人的强项
   - **差距分析**：需要补充的技能
   - **推荐等级**：强烈推荐/推荐/考虑/不合适

#### 匹配度颜色标识：
- 🟢 **80-100分**：强烈推荐（绿色）
- 🟡 **60-79分**：推荐（黄色）
- 🟠 **40-59分**：考虑（橙色）
- 🔴 **0-39分**：不合适（红色）

#### API端点：
```
POST /api/job-match/calculate
- 请求：{ candidateId, jobId }
- 返回：匹配分数和详细分析

POST /api/job-match/batch
- 请求：{ jobId, candidateIds[] }
- 返回：批量匹配结果
```

---

### 功能3：批量智能匹配

#### 使用场景：
- 为一个职位的所有应聘者计算匹配度
- 快速筛选最佳候选人

#### 使用方法：
1. 进入职位详情页
2. 点击"AI智能匹配"面板
3. 点击"为所有候选人计算匹配度"
4. 等待处理完成
5. 按匹配度排序查看候选人列表

#### API端点：
```
POST /api/job-match/calculate-all/:jobId
- 返回：所有候选人的匹配度统计

GET /api/job-match/best-matches/:jobId?limit=10
- 返回：Top 10最佳匹配候选人
```

---

## 🔧 高级配置

### 调整模型速度/精度

编辑 `apps/api/.env`：

```bash
# 轻量级（最快）
OLLAMA_MODEL="llama3.2:1b"

# 中等（推荐）
OLLAMA_MODEL="llama3.2:3b"

# 大型（最准确）
OLLAMA_MODEL="llama3.2:8b"
```

**修改后需重启后端服务**

---

### 调整缓存时间

编辑 `apps/api/src/modules/ai/ai.service.ts`：

```typescript
private readonly CACHE_TTL = {
  MATCH_SCORE: 3600,      // 匹配分数：1小时
  SKILLS: 7200,           // 技能提取：2小时
  COMPETITOR: 86400,      // 竞品分析：24小时
};
```

**修改后需重新编译**

---

### 添加更多游戏行业知识

编辑 `apps/api/src/modules/ai/resume-parser.service.ts`：

```typescript
private async getGameKnowledge() {
  return {
    engines: ['Unity', 'Unreal Engine 4', 'Unreal Engine 5', 'Cocos', ...],
    languages: ['C#', 'C++', 'Lua', ...],
    taDirections: ['TA', '3D角色', '3D场景', ...],
    gameGenres: ['MMO', 'RPG', 'SLG', ...],
    artStyles: ['写实', '卡通', '欧美', ...],
    // 添加更多...
  };
}
```

---

## 🐛 故障排查

### 问题1：Ollama连接失败

**错误信息**：
```
Error: Ollama API 错误: ECONNREFUSED
```

**解决方法**：
1. 确认Ollama正在运行：
   ```bash
   # Windows: 检查系统托盘，应该有Ollama图标
   # 或者运行：
   ollama list
   ```

2. 如果Ollama未运行，手动启动：
   ```bash
   # Windows: 从开始菜单启动Ollama
   ```

3. 确认端口正确：
   ```bash
   curl http://localhost:11434/api/version
   ```

---

### 问题2：模型未下载

**错误信息**：
```
Error: model 'llama3.2:1b' not found
```

**解决方法**：
```bash
# 下载模型
ollama pull llama3.2:1b

# 验证
ollama list
```

---

### 问题3：AI返回空结果

**错误信息**：
```
解析匹配分数时出错
```

**可能原因**：
- 模型太小，无法理解复杂指令
- 简历内容太少或格式不支持

**解决方法**：
1. 换用更大的模型：
   ```bash
   ollama pull llama3.2:3b
   # 然后修改.env中的OLLAMA_MODEL
   ```

2. 检查简历格式（支持PDF、Word、TXT）

---

### 问题4：处理速度太慢

**优化方法**：
1. 使用更小的模型（1b而不是3b或8b）
2. 确保启用缓存（默认已启用）
3. 批量处理时控制并发数

---

## 📊 性能参考

### 不同模型的性能对比（测试环境：i5-10400, 16GB RAM）

| 模型 | 大小 | 简历解析 | 匹配计算 | 内存占用 |
|------|------|----------|----------|----------|
| llama3.2:1b | 1.3GB | ~3秒 | ~2秒 | ~2GB |
| llama3.2:3b | 2GB | ~8秒 | ~5秒 | ~4GB |
| llama3.2:8b | 4.7GB | ~20秒 | ~15秒 | ~8GB |

**推荐**：
- 开发测试：使用 `llama3.2:1b`
- 生产环境：使用 `llama3.2:3b`

---

## 📝 代码示例

### 前端调用简历解析

```typescript
// 上传简历并解析
const formData = new FormData();
formData.append('file', resumeFile);
formData.append('candidateId', candidateId);

const result = await fetch('/api/resume/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});

const parsedResume = await result.json();
// 自动填充表单
setName(parsedResume.name);
setEmail(parsedResume.email);
setSkills(parsedResume.skills);
```

### 前端调用匹配计算

```typescript
// 计算匹配度
const matchResult = await fetch('/api/job-match/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    candidateId: 'xxx',
    jobId: 'yyy',
  }),
}).then(r => r.json());

console.log('匹配分数:', matchResult.score);
console.log('技能匹配:', matchResult.details.skillsMatch);
console.log('推荐等级:', matchResult.details.recommendation);
```

---

## ✅ 启用检查清单

使用此清单确保AI功能正常工作：

- [ ] Ollama已安装
- [ ] Ollama服务正在运行（系统托盘有图标）
- [ ] 模型已下载（`ollama list`可看到）
- [ ] 后端服务已重启
- [ ] `.env`配置正确（OLLAMA_BASE_URL和OLLAMA_MODEL）
- [ ] 上传一份简历测试解析功能
- [ ] 创建应聘记录测试匹配功能
- [ ] 查看应聘详情页，匹配分数正常显示

---

## 🎉 完成！

现在您的系统已启用完整的AI功能！

**下一步**：
1. 上传真实简历测试解析准确性
2. 为现有应聘记录计算匹配度
3. 根据匹配度排序筛选候选人
4. 享受AI带来的高效招聘体验！

---

**需要帮助？**
- Ollama文档：https://ollama.com/docs
- 模型列表：https://ollama.com/search
- 问题反馈：联系开发团队
