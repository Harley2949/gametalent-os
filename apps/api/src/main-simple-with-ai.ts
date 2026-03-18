import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Module, Controller, Get, Post, Put, Delete, UseInterceptors, UploadedFile, UploadedFiles, Body, Param } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';
import { PrismaClient } from '@prisma/client';
import * as pdfjslib from 'pdfjs-dist';

// 配置 PDF.js for Node.js 环境
(pdfjslib as any).GlobalWorkerOptions.workerSrc = ''; // 禁用 worker（Node.js 不支持）

// 数据库 URL
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://gametalent:gametalent_password@127.0.0.1:5432/gametalent_os?schema=public';

const prisma = new PrismaClient();

// Ollama 配置
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

// AI 解析函数
async function parseResumeWithAI(text: string) {
  console.log('🤖 开始 AI 解析...');
  console.log('📝 文本总长度:', text.length);
  console.log('📄 前500字符预览:', text.substring(0, 500));

  try {
    // 首先测试 Ollama 连接
    console.log('🔗 测试 Ollama 连接:', OLLAMA_BASE_URL);
    try {
      const testResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5秒超时
      });

      if (!testResponse.ok) {
        throw new Error(`Ollama 返回错误: ${testResponse.status}`);
      }

      const modelsData = await testResponse.json() as { models?: Array<{ name: string }> };
      const availableModels = modelsData.models?.map((m: any) => m.name) || [];
      console.log('✅ Ollama 连接成功');
      console.log('📦 可用模型:', availableModels.join(', '));
      console.log('🎯 使用模型:', OLLAMA_MODEL);

      if (!availableModels.includes(OLLAMA_MODEL)) {
        console.warn(`⚠️  模型 ${OLLAMA_MODEL} 不在可用列表中，可能失败`);
      }
    } catch (testError: any) {
      console.error('❌ Ollama 连接失败:', testError.message);
      console.log('⬇️ 降级到基础解析...');
      return parseResumeBasic(text);
    }

    // 截取前5000字符（足够详细的大部分简历）
    const resumeText = text.length > 5000 ? text.substring(0, 5000) + '...' : text;

    const prompt = `You are a professional resume parser. CRITICAL RULE: You must extract information from the ACTUAL resume text below. DO NOT make up or invent any information. If a field is not found in the resume, return null or empty string.

Resume text to parse:
"""
${resumeText}
"""

EXTRACTION RULES:
1. Extract phone number: Look for patterns like "1[3-9]\\d{9}", "+86 1[3-9]\\d{9}", "tel:", "phone:", "手机:", "电话"
2. Extract company name: Look after "公司", "Company", "at", "任职于", "工作于"
3. Extract job title: Look after "职位", "Position", "工程师", "经理", "总监"
4. Extract experience: Look for "年经验", "years of experience", work duration
5. Extract education: Look for "大学", "学院", "University", "学历", "学位", "major"

Required JSON format:
{
  "name": "actual name from resume or null",
  "email": "actual email from resume or null",
  "phoneNumber": "actual phone number (format: +86 1xxxxxxxxx) or null",
  "currentTitle": "current job title or null",
  "currentCompany": "current company name or null",
  "yearsOfExperience": number (extract from text, e.g., "3年经验" = 3) or 0,
  "skills": ["skill1", "skill2", "skill3"],
  "education": [
    {
      "school": "university name",
      "degree": "degree type (学士, 硕士, 博士)",
      "major": "major field"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "role": "role in project",
      "description": "brief description"
    }
  ]
}

Now parse the resume and return JSON:`;

    console.log('📤 发送到AI的Prompt长度:', prompt.length);
    console.log('📤 发送到AI的简历文本长度:', resumeText.length);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 2000,
          top_k: 40,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json() as any;
    console.log('✅ AI 响应成功');

    let responseText = data.response || '';
    console.log('📄 AI 原始响应长度:', responseText.length);
    console.log('📄 AI 响应前200字符:', responseText.substring(0, 200));

    // 尝试提取 JSON
    console.log('🔍 开始提取 JSON...');

    // 尝试多种方式提取 JSON
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn('⚠️  未找到 JSON，尝试清理文本');
      // 尝试清理 markdown 代码块
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/```/g, '')
        .trim();
      jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      console.log('🧹 清理后文本长度:', cleanedText.length);
    }

    if (!jsonMatch) {
      console.error('❌ 无法从 AI 响应中提取 JSON');
      console.log('📄 AI 完整响应:', responseText);
      throw new Error('无法从 AI 响应中提取 JSON');
    }

    const jsonStr = jsonMatch[0];
    console.log('✅ 提取到JSON字符串，长度:', jsonStr.length);
    console.log('📄 JSON预览:', jsonStr.substring(0, 200));

    const parsed = JSON.parse(jsonStr);
    console.log('✅ JSON 解析成功:', {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phoneNumber,
      skills: parsed.skills?.length || 0
    });

    return parsed;
  } catch (error) {
    console.error('❌ AI 解析失败:', error);
    console.error('❌ 错误详情:', error instanceof Error ? error.message : String(error));
    // 返回基本解析结果
    console.log('⬇️ 降级到基础解析...');
    return parseResumeBasic(text);
  }
}

// PDF 文本提取函数（使用 pdfjs-dist）
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  console.log('📄 开始提取 PDF 文本...');

  try {
    // 加载 PDF 文档（将 Buffer 转换为 Uint8Array）
    const uint8ArrayData = new Uint8Array(buffer);
    const loadingTask = pdfjslib.getDocument({ data: uint8ArrayData });
    const pdfDocument = await loadingTask.promise;
    console.log(`✅ PDF 加载成功，共 ${pdfDocument.numPages} 页`);

    let fullText = '';

    // 遍历所有页面
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      console.log(`📊 第 ${pageNum} 页 textContent.items 数量: ${textContent.items.length}`);

      // 提取文本并按位置排序
      const pageText = textContent.items
        .map((item: any) => {
          console.log(`  - 文本项: "${item.str}" (${item.width}x${item.height})`);
          return item.str;
        })
        .join(' ');

      fullText += pageText + '\n';
      console.log(`✅ 第 ${pageNum}/${pdfDocument.numPages} 页提取成功，文本长度: ${pageText.length}`);

      // 如果文本为空，警告可能是图片型 PDF
      if (pageText.length === 0) {
        console.warn(`⚠️  第 ${pageNum} 页没有提取到文本，可能是图片型 PDF（扫描件）`);
      }
    }

    console.log(`✅ PDF 文本提取完成，总长度: ${fullText.length}`);
    console.log('📄 前500字符预览:', fullText.substring(0, 500));

    return fullText;
  } catch (error) {
    console.error('❌ PDF 解析失败:', error);
    throw error;
  }
}

// 基础解析函数（fallback）- 改进版
function parseResumeBasic(text: string) {
  console.log('📋 使用基础解析...');

  // 清理文本：移除PDF提取时产生的多余空格（字符之间的空格）
  let cleanedText = text.replace(/\s+/g, ' ').trim();

  // 尝试进一步清理：如果中文字符之间有空格，移除这些空格
  // 例如："王 华 晗" -> "王华晗"
  cleanedText = cleanedText.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2');

  // 清理邮箱中的空格
  cleanedText = cleanedText.replace(/([\w.-])\s+@/g, '$1@');
  cleanedText = cleanedText.replace(/@\s+([\w.-]+)/g, '@$1');
  cleanedText = cleanedText.replace(/([\w.-])\s+\./g, '$1.');

  console.log('🧹 文本清理完成，长度:', text.length, '->', cleanedText.length);
  console.log('📄 清理后前200字符:', cleanedText.substring(0, 200));

  // 提取邮箱（支持带空格的格式）
  const emailMatch = cleanedText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : '';

  // 提取手机号（支持多种格式）
  const phoneMatch = cleanedText.match(/1[3-9]\d{9}/) || cleanedText.match(/1[3-9]\d\s*\d{4}\s*\d{4}/);
  const phoneNumber = phoneMatch ? phoneMatch[0].replace(/\s/g, '') : '';

  // 提取姓名（查找"姓名"关键字附近的内容，或第一行）
  let name = '待完善';
  const namePatterns = [
    /姓名[：:]\s*([^\n\r]{2,10})/,
    /^([^\n\r]{2,6})\s*\n/, // 第一行可能是姓名（放宽到6字符）
    /([^\n\r]{2,6})\s+电话/,
    // 从第一行提取中文名字
    /^[\s]*([^\n\r]{2,6})[\s]*\n/,
  ];
  for (const pattern of namePatterns) {
    const match = cleanedText.match(pattern);
    if (match && match[1]) {
      const potentialName = match[1].trim();
      // 验证是否是有效姓名（主要是中文字符）
      if (/^[\u4e00-\u9fa5]{2,6}$/.test(potentialName)) {
        name = potentialName;
        break;
      }
    }
  }

  // 提取技能
  const skills: string[] = [];
  const skillSection = cleanedText.match(/(?:技能|Skill|技术栈)[：:：\s]*([^\n\r]+)/i);
  if (skillSection) {
    const skillText = skillSection[1];
    // 提取常见技能关键词
    const skillKeywords = skillText.match(/([A-Za-z\u4e00-\u9fa5+#]{2,15})/g) || [];
    skills.push(...skillKeywords.filter(s => s.length >= 2));
  }

  // 从全文中提取常见技能
  const commonSkills = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
    'Node.js', 'Spring', 'Django', 'Flask', 'PyTorch', 'TensorFlow',
    'C++', 'C语言', 'Go', 'Rust', 'SQL', 'MongoDB', 'Redis', 'Docker',
    'Kubernetes', 'Git', 'Linux', '机器学习', '深度学习', '人工智能',
    'HTML', 'CSS', '前端', '后端', '全栈', '算法', '数据结构',
    'MATLAB', 'C51', 'STM32', '单片机', '嵌入式', '电路设计',
  ];

  commonSkills.forEach(skill => {
    if (cleanedText.includes(skill) && !skills.includes(skill)) {
      skills.push(skill);
    }
  });

  // 提取教育背景
  const education: any[] = [];
  const eduMatches = cleanedText.match(/教育背景[：:：\s]*([^\n]+)/i);
  if (eduMatches) {
    const schoolMatch = text.match(/([\u4e00-\u9fa5]+大学|学院)/);
    if (schoolMatch) {
      education.push({
        school: schoolMatch[0],
        degree: '本科',
        major: '',
      });
    }
  }

  // 提取工作年限
  let yearsOfExperience = 0;
  const yearMatch = cleanedText.match(/(\d+)\s*年/i);
  if (yearMatch) {
    yearsOfExperience = parseInt(yearMatch[1], 10);
  }

  console.log('📊 基础解析结果:', {
    name,
    email,
    phone: phoneNumber,
    skillsCount: skills.length,
    skills: skills.slice(0, 10), // 显示前10个技能
    educationCount: education.length,
  });

  return {
    name,
    email,
    phoneNumber,
    currentTitle: '',
    currentCompany: '',
    yearsOfExperience,
    skills: skills.slice(0, 20), // 最多20个技能
    education,
    projects: [],
  };
}

// 简化的控制器
@Controller('resume-upload')
class ResumeUploadController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @UploadedFile() file: any,
    @Body('candidateId') candidateId?: string,
  ) {
    if (!file) {
      return { success: false, message: '请选择要上传的文件' };
    }

    try {
      console.log('📤 开始处理上传:', file.originalname);

      // 1. 提取 PDF 内容
      const buffer = file.buffer;
      let text = '';

      if (file.mimetype === 'application/pdf') {
        text = await extractTextFromPDF(buffer);
        console.log('✅ PDF 提取成功，文本长度:', text.length);
      } else {
        text = '[图片文件 - 需要 OCR 解析]';
      }

      // 2. AI 解析（或基础解析）
      const parsedData = await parseResumeWithAI(text);

      // 3. 创建或查找候选人
      let candidate;
      let isNewCandidate = false;

      const email = parsedData.email || `temp_${Date.now()}@example.com`;

      if (candidateId) {
        candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
      }

      if (!candidate) {
        try {
          candidate = await prisma.candidate.create({
            data: {
              email,
              name: parsedData.name || '待完善',
              phoneNumber: parsedData.phoneNumber || '',
              source: 'UPLOAD',
              status: 'ACTIVE',
              currentTitle: parsedData.currentTitle || '',
              currentCompany: parsedData.currentCompany || '',
              yearsOfExperience: parsedData.yearsOfExperience || 0,
            },
          });
          isNewCandidate = true;
          console.log('✅ 创建新候选人:', candidate.id, parsedData.name);
        } catch (error: any) {
          if (error.code === 'P2002') {
            console.log('📧 邮箱已存在，查找现有候选人...');
            candidate = await prisma.candidate.findUnique({ where: { email } });
          } else {
            throw error;
          }
        }
      }

      // 4. 创建简历记录（包含解析数据）
      const resume = await prisma.resume.create({
        data: {
          candidateId: candidate.id,
          title: file.originalname,
          fileName: file.originalname,
          fileUrl: `/uploads/resumes/${file.originalname}`,
          fileSize: file.size,
          fileType: file.mimetype,
          rawData: text,
          rawText: text,
          parsedData: {
            ...parsedData,
            extractedAt: new Date().toISOString(),
            aiModel: OLLAMA_MODEL,
          },
          skills: parsedData.skills || [],
          status: 'READY',
          parsedAt: new Date(),
          isPrimary: true,
        },
      });

      console.log('✅ 简历上传并解析成功:', resume.id);

      return {
        success: true,
        message: '简历上传成功',
        data: {
          resumeId: resume.id,
          candidateId: candidate.id,
          isNewCandidate: isNewCandidate,
          parsedData: parsedData,
        },
      };
    } catch (error) {
      console.error('❌ 上传错误:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '上传失败',
      };
    }
  }

  @Post('batch')
  @UseInterceptors(FilesInterceptor('files', 10))
  async batchUploadResumes(
    @UploadedFiles() files: any[],
    @Body('candidateId') candidateId?: string,
  ) {
    if (!files || files.length === 0) {
      return { success: false, message: '请选择要上传的文件' };
    }

    console.log('📦 开始批量上传，文件数:', files.length);

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        console.log(`\n📤 处理文件 ${files.indexOf(file) + 1}/${files.length}:`, file.originalname);

        // 1. 提取 PDF 内容
        const buffer = file.buffer;
        let text = '';

        if (file.mimetype === 'application/pdf') {
          text = await extractTextFromPDF(buffer);
          console.log('✅ PDF 提取成功，文本长度:', text.length);
        } else {
          text = '[图片文件 - 需要 OCR 解析]';
        }

        // 2. AI 解析（或基础解析）
        const parsedData = await parseResumeWithAI(text);

        // 3. 创建或查找候选人
        let candidate;
        let isNewCandidate = false;

        const email = parsedData.email || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;

        if (candidateId) {
          candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
        }

        if (!candidate) {
          try {
            candidate = await prisma.candidate.create({
              data: {
                email,
                name: parsedData.name || '待完善',
                phoneNumber: parsedData.phoneNumber || '',
                source: 'UPLOAD',
                status: 'ACTIVE',
                currentTitle: parsedData.currentTitle || '',
                currentCompany: parsedData.currentCompany || '',
                yearsOfExperience: parsedData.yearsOfExperience || 0,
              },
            });
            isNewCandidate = true;
            console.log('✅ 创建新候选人:', candidate.id, parsedData.name);
          } catch (error: any) {
            if (error.code === 'P2002') {
              console.log('📧 邮箱已存在，查找现有候选人...');
              candidate = await prisma.candidate.findUnique({ where: { email } });
            } else {
              throw error;
            }
          }
        }

        // 4. 创建简历记录
        const resume = await prisma.resume.create({
          data: {
            candidateId: candidate.id,
            title: file.originalname,
            fileName: file.originalname,
            fileUrl: `/uploads/resumes/${file.originalname}`,
            fileSize: file.size,
            fileType: file.mimetype,
            rawData: text,
            rawText: text,
            parsedData: {
              ...parsedData,
              extractedAt: new Date().toISOString(),
              aiModel: OLLAMA_MODEL,
            },
            skills: parsedData.skills || [],
            status: 'READY',
            parsedAt: new Date(),
            isPrimary: true,
          },
        });

        console.log('✅ 简历上传并解析成功:', resume.id);

        results.push({
          success: true,
          fileName: file.originalname,
          resumeId: resume.id,
          candidateId: candidate.id,
          candidateName: candidate.name,
          parsedData: parsedData,
        });
      } catch (error: any) {
        console.error(`❌ 处理文件 ${file.originalname} 失败:`, error.message);
        errors.push({
          fileName: file.originalname,
          error: error.message,
        });
      }
    }

    console.log(`\n📊 批量上传完成: 成功 ${results.length}/${files.length}, 失败 ${errors.length}`);

    return {
      success: true,
      message: `批量上传完成: ${results.length} 个成功, ${errors.length} 个失败`,
      data: {
        total: files.length,
        successful: results.length,
        failed: errors.length,
        results: results,
        errors: errors,
      },
    };
  }

  @Get('status/:resumeId')
  async getParsingStatus(@Param('resumeId') resumeId: string) {
    console.log('📊 查询简历状态, resumeId:', resumeId);

    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });

    if (!resume) {
      return { success: false, message: '简历不存在' };
    }

    return {
      success: true,
      data: {
        resumeId: resume.id,
        status: resume.status,
        progress: resume.status === 'READY' ? 100 : 0,
        parsedData: resume.parsedData,
      },
    };
  }
}

// 候选人查询控制器
@Controller('candidates')
class CandidatesController {
  // 获取所有候选人
  @Get()
  async getAllCandidates() {
    try {
      console.log('📋 查询所有候选人');

      const candidates = await prisma.candidate.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100, // 限制返回100条
      });

      console.log(`✅ 找到 ${candidates.length} 位候选人`);

      return {
        success: true,
        data: candidates,
        total: candidates.length,
      };
    } catch (error) {
      console.error('❌ 查询候选人失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '查询失败',
      };
    }
  }

  // 获取单个候选人详情
  @Get(':id')
  async getCandidateById(@Param('id') id: string) {
    try {
      console.log('🔍 查询候选人详情, id:', id);

      const candidate = await prisma.candidate.findUnique({
        where: { id },
        include: {
          resumes: {
            where: { isPrimary: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!candidate) {
        console.log('❌ 候选人不存在:', id);
        return {
          success: false,
          message: '候选人不存在',
        };
      }

      console.log('✅ 找到候选人:', candidate.name, candidate.email);

      return {
        success: true,
        data: candidate,
      };
    } catch (error) {
      console.error('❌ 查询候选人详情失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '查询失败',
      };
    }
  }

  // 删除候选人
  @Delete(':id')
  async deleteCandidate(@Param('id') id: string) {
    try {
      console.log('🗑️ 删除候选人, id:', id);

      // 检查候选人是否存在
      const candidate = await prisma.candidate.findUnique({
        where: { id },
      });

      if (!candidate) {
        console.log('❌ 候选人不存在:', id);
        return {
          success: false,
          message: '候选人不存在',
        };
      }

      console.log('✅ 找到候选人，准备删除:', candidate.name);

      // 删除候选人（级联删除关联的简历等数据）
      await prisma.candidate.delete({
        where: { id },
      });

      console.log('✅ 候选人删除成功:', candidate.name);

      return {
        success: true,
        message: '删除成功',
        data: { id, name: candidate.name },
      };
    } catch (error) {
      console.error('❌ 删除候选人失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '删除失败',
      };
    }
  }

  // 更新候选人
  @Put(':id')
  async updateCandidate(@Param('id') id: string, @Body() updates: any) {
    try {
      console.log('✏️ 更新候选人, id:', id);
      console.log('📝 更新数据:', JSON.stringify(updates, null, 2));

      // 检查候选人是否存在
      const existing = await prisma.candidate.findUnique({
        where: { id },
      });

      if (!existing) {
        console.log('❌ 候选人不存在:', id);
        return {
          success: false,
          message: '候选人不存在',
        };
      }

      console.log('✅ 找到候选人:', existing.name);

      // 清理不允许更新的字段
      const {
        id: _id,
        createdAt,
        updatedAt,
        source,
        // ...其他不允许更新的字段
        ...allowedUpdates
      } = updates;

      // 更新候选人
      const updated = await prisma.candidate.update({
        where: { id },
        data: allowedUpdates,
      });

      console.log('✅ 候选人更新成功:', updated.name);

      return {
        success: true,
        message: '更新成功',
        data: updated,
      };
    } catch (error) {
      console.error('❌ 更新候选人失败:', error);
      console.error('❌ 错误详情:', error instanceof Error ? error.message : String(error));

      // 检查是否是唯一性约束错误
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return {
          success: false,
          message: '邮箱已被使用，请使用其他邮箱',
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : '更新失败',
      };
    }
  }
}

@Controller('health')
class HealthController {
  @Get()
  health() {
    return { status: 'ok', message: 'GameTalent OS API (简化版 + AI解析)' };
  }
}

// 简化的模块
@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [ResumeUploadController, HealthController, CandidatesController],
})
class SimpleAppModule {}

// 启动函数
async function bootstrap() {
  const app = await NestFactory.create(SimpleAppModule);

  // Enable CORS - 允许多个端口
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
    credentials: true,
  });

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // API prefix
  app.setGlobalPrefix('api', { exclude: ['health'] });

  const port = 3006;
  await app.listen(port);

  console.log(`================================================`);
  console.log(`🚀 GameTalent OS API (简化版 + AI解析) 已启动!`);
  console.log(`📍 服务地址: http://localhost:${port}`);
  console.log(`🤖 AI 模型: ${OLLAMA_MODEL}`);
  console.log(`🔧 Ollama: ${OLLAMA_BASE_URL}`);
  console.log(`================================================`);
}

bootstrap().catch(console.error);
