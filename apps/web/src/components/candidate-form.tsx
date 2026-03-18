'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import { Input } from '@gametalent/ui';
import { Label } from '@gametalent/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Textarea } from '@gametalent/ui';
import { X, Plus, GraduationCap, Briefcase, Edit2, Trash2, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

import { useToast } from '@/components/shared/Toast';
import { getAuthHeaders } from '@/lib/api';
import type { Candidate, CreateCandidateDto, UpdateCandidateDto } from '@/types/candidate';

interface CandidateFormProps {
  candidate?: Candidate;
  isEditing?: boolean;
  onSubmit: (data: CreateCandidateDto | UpdateCandidateDto) => Promise<void>;
}

const statusOptions = [
  { value: 'ACTIVE', label: '活跃' },
  { value: 'INACTIVE', label: '非活跃' },
  { value: 'HIRED', label: '已录用' },
  { value: 'ARCHIVED', label: '已归档' },
];

const sourceOptions = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'REFERRAL', label: '内推' },
  { value: 'DIRECT', label: '直投' },
  { value: 'AGENCY', label: '猎头' },
  { value: 'OTHER', label: '其他' },
];

export function CandidateForm({ candidate, isEditing = false, onSubmit }: CandidateFormProps) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // 简历上传相关状态
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [formData, setFormData] = useState({
    name: candidate?.name || '',
    email: candidate?.email || '',
    phoneNumber: candidate?.phoneNumber || '',
    linkedinUrl: candidate?.linkedinUrl || '',
    githubUrl: candidate?.githubUrl || '',
    portfolioUrl: candidate?.portfolioUrl || '',
    location: candidate?.location || '',
    currentCompany: candidate?.currentCompany || '',
    currentTitle: candidate?.currentTitle || '',
    expectedSalary: candidate?.expectedSalary || '',
    noticePeriod: candidate?.noticePeriod || '',
    yearsOfExperience: candidate?.yearsOfExperience || '',
    notes: candidate?.notes || '',
    status: candidate?.status || 'ACTIVE',
    source: candidate?.source || 'OTHER',
    tags: candidate?.tags || [],
    education: [] as Array<{
      school: string;
      major: string;
      degree?: string;
      startDate: string;
      endDate?: string;
    }>,
    workExperience: [] as Array<{
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      description?: string;
    }>,
  });

  // 内联表单展开状态管理
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);

  // 临时数据状态
  const [tempEducation, setTempEducation] = useState({
    school: '',
    major: '',
    degree: '',
    startDate: '',
    endDate: ''
  });

  const [tempWork, setTempWork] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // 简历上传处理函数
  const handleResumeUpload = async (file: File) => {
    if (!file) return;

    console.log('📄 开始上传简历:', file.name);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3006/api/resume-upload/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();
      console.log('✅ 简历解析成功:', result);

      if (!result.success || !result.data) {
        throw new Error(result.message || '解析失败');
      }

      const data = result.data;
      const parsed = data.parsedData || {};

      // 如果候选人已创建（返回了 candidateId），跳转到编辑页
      if (data.candidateId && data.isNewCandidate) {
        toast.success(
          `✅ 简历解析成功！候选人已创建：${parsed.name || '未知'}`
        );
        setTimeout(() => {
          router.push(`/candidates/${data.candidateId}/edit`);
        }, 1500);
        return;
      }

      // 否则，自动填充表单字段
      setFormData((prev) => ({
        ...prev,
        name: parsed.name || prev.name,
        email: parsed.email || prev.email,
        phoneNumber: parsed.phoneNumber || prev.phoneNumber,
        currentCompany: parsed.currentCompany || prev.currentCompany,
        currentTitle: parsed.currentTitle || prev.currentTitle,
        yearsOfExperience: parsed.yearsOfExperience || prev.yearsOfExperience,
        notes: parsed.notes || prev.notes,
        // 填充教育经历
        education: parsed.education?.length ? parsed.education.map((edu: any) => ({
          school: edu.school || '',
          major: edu.major || '',
          degree: edu.degree || '',
          startDate: '', // 需要从简历中解析
          endDate: '',
        })) : prev.education,
        // 填充工作经历
        workExperience: parsed.projects?.length ? parsed.projects.map((proj: any) => ({
          company: proj.company || '',
          position: proj.role || '',
          startDate: '',
          endDate: '',
          description: proj.description || '',
        })) : prev.workExperience,
      }));

      // 保存文件和解析数据
      setUploadedFile(file);
      setParsedData(parsed);

      toast.success(
        `✅ 简历解析成功！${parsed.name ? `已提取：${parsed.name}` : '已自动填充表单'}`
      );
    } catch (error) {
      console.error('❌ 简历解析失败:', error);
      toast.error('❌ 解析失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleResumeUpload(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('已移除简历，请手动填写或重新上传');
  };

  // 拖拽处理函数
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // 验证文件类型
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('❌ 仅支持 PDF 和 DOCX 格式的简历文件');
      return;
    }

    console.log('📄 拖拽上传文件:', file.name);
    handleResumeUpload(file);
  };

  // 教育经历内联表单处理函数
  const startAddingEducation = () => {
    setIsAddingEducation(true);
    setEditingEducationIndex(null);
    setTempEducation({
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: ''
    });
  };

  const startEditingEducation = (index: number) => {
    setEditingEducationIndex(index);
    setIsAddingEducation(false);
    const edu = formData.education[index];
    setTempEducation({
      school: edu.school,
      major: edu.major,
      degree: edu.degree || '',
      startDate: edu.startDate,
      endDate: edu.endDate || ''
    });
  };

  const saveEducation = () => {
    if (!tempEducation.school || !tempEducation.major || !tempEducation.startDate) {
      alert('请填写必填字段（学校名称、专业、开始日期）');
      return;
    }

    if (editingEducationIndex !== null) {
      // 编辑现有记录
      setFormData((prev) => ({
        ...prev,
        education: prev.education.map((edu, i) =>
          i === editingEducationIndex ? tempEducation : edu
        ),
      }));
    } else {
      // 添加新记录
      setFormData((prev) => ({
        ...prev,
        education: [...prev.education, tempEducation],
      }));
    }

    // 收起表单
    setIsAddingEducation(false);
    setEditingEducationIndex(null);
    setTempEducation({
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: ''
    });
  };

  const cancelEducation = () => {
    setIsAddingEducation(false);
    setEditingEducationIndex(null);
    setTempEducation({
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: ''
    });
  };

  const deleteEducation = (index: number) => {
    if (confirm('确定要删除这条教育经历吗？')) {
      setFormData((prev) => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index),
      }));
    }
  };

  // 工作经历内联表单处理函数
  const startAddingWork = () => {
    setIsAddingWork(true);
    setEditingWorkIndex(null);
    setTempWork({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const startEditingWork = (index: number) => {
    setEditingWorkIndex(index);
    setIsAddingWork(false);
    const work = formData.workExperience[index];
    setTempWork({
      company: work.company,
      position: work.position,
      startDate: work.startDate,
      endDate: work.endDate || '',
      description: work.description || ''
    });
  };

  const saveWork = () => {
    if (!tempWork.company || !tempWork.position || !tempWork.startDate) {
      alert('请填写必填字段（公司名称、职位、开始日期）');
      return;
    }

    if (editingWorkIndex !== null) {
      // 编辑现有记录
      setFormData((prev) => ({
        ...prev,
        workExperience: prev.workExperience.map((exp, i) =>
          i === editingWorkIndex ? tempWork : exp
        ),
      }));
    } else {
      // 添加新记录
      setFormData((prev) => ({
        ...prev,
        workExperience: [...prev.workExperience, tempWork],
      }));
    }

    // 收起表单
    setIsAddingWork(false);
    setEditingWorkIndex(null);
    setTempWork({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const cancelWork = () => {
    setIsAddingWork(false);
    setEditingWorkIndex(null);
    setTempWork({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const deleteWork = (index: number) => {
    if (confirm('确定要删除这条工作经历吗？')) {
      setFormData((prev) => ({
        ...prev,
        workExperience: prev.workExperience.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let data: any = {
        ...formData,
        yearsOfExperience: formData.yearsOfExperience
          ? parseInt(formData.yearsOfExperience as string)
          : undefined,
      };

      // 新建时移除 status 字段（status 由后端自动设置）
      if (!isEditing) {
        const { status, education, workExperience, ...allowedData } = data;
        data = allowedData;

        // 新建时必填字段验证
        if (!data.email) {
          toast.warning('请输入邮箱');
          return;
        }
      }

      await onSubmit(data);
      // ⚠️ 移除自动跳转，由父组件处理跳转逻辑
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 简历上传区域 */}
        {!isEditing && (
          <Card
            className={`border-2 border-dashed transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-100 scale-105'
                : 'border-blue-200 bg-blue-50/50 hover:border-blue-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                    isDragOver
                      ? 'bg-blue-200'
                      : 'bg-blue-100'
                  }`}>
                    <Upload className={`h-6 w-6 transition-colors ${
                      isDragOver ? 'text-blue-700' : 'text-blue-600'
                    }`} />
                  </div>
                </div>

                <h3 className={`text-lg font-semibold mb-2 transition-colors ${
                  isDragOver ? 'text-blue-700' : 'text-blue-900'
                }`}>
                  📄 {isDragOver ? '松开鼠标上传简历' : '有简历？一键上传自动填充'}
                </h3>
                <p className={`text-sm mb-4 ${
                  isDragOver ? 'text-blue-800' : 'text-blue-700'
                }`}>
                  支持 PDF、DOCX 格式，AI 将自动提取姓名、邮箱、工作经历等信息
                </p>

                {uploadedFile ? (
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-green-200 shadow-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {parsedData?.name && `已提取：${parsedData.name}`}
                        {!parsedData?.name && '解析完成'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      移除
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          解析中...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          选择简历文件
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {!uploadedFile && !uploading && (
                  <p className={`text-xs mt-3 ${
                    isDragOver ? 'text-blue-700 font-medium' : 'text-gray-500'
                  }`}>
                    {isDragOver ? '或拖到这里' : '拖拽简历到这里，或点击上方按钮'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>填写候选人的基本联系信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  姓名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="请输入姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  邮箱 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required={!isEditing}
                  placeholder="example@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">手机号码</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  placeholder="请输入手机号码"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">所在地</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="例如：北京"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  placeholder="LinkedIn个人主页"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub</Label>
                <Input
                  id="githubUrl"
                  value={formData.githubUrl}
                  onChange={(e) => handleChange('githubUrl', e.target.value)}
                  placeholder="GitHub个人主页"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">作品集</Label>
                <Input
                  id="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                  placeholder="个人作品集网站"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 职业信息 */}
        <Card>
          <CardHeader>
            <CardTitle>职业信息</CardTitle>
            <CardDescription>填写候选人的职业背景信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentCompany">当前公司</Label>
                <Input
                  id="currentCompany"
                  value={formData.currentCompany}
                  onChange={(e) => handleChange('currentCompany', e.target.value)}
                  placeholder="例如：腾讯游戏"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentTitle">当前职位</Label>
                <Input
                  id="currentTitle"
                  value={formData.currentTitle}
                  onChange={(e) => handleChange('currentTitle', e.target.value)}
                  placeholder="例如：高级游戏开发工程师"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">工作年限（年）</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                  placeholder="例如：5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedSalary">期望薪资</Label>
                <Input
                  id="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={(e) => handleChange('expectedSalary', e.target.value)}
                  placeholder="例如：30-40K"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noticePeriod">离职通知期</Label>
                <Input
                  id="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={(e) => handleChange('noticePeriod', e.target.value)}
                  placeholder="例如：1个月"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 教育经历 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              教育经历
            </CardTitle>
            <CardDescription>添加候选人的教育背景信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.education.length === 0 && !isAddingEducation ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-3">暂无教育经历</p>
                <Button type="button" variant="secondary" size="sm" onClick={startAddingEducation}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加教育经历
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 已添加的教育经历列表 */}
                {formData.education.map((edu, index) => (
                  <div key={index} className="border rounded-lg">
                    {editingEducationIndex === index ? (
                      // 编辑模式 - 内联表单
                      <div className="p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              学校名称 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={tempEducation.school}
                              onChange={(e) => setTempEducation({ ...tempEducation, school: e.target.value })}
                              placeholder="例如：清华大学"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              专业 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={tempEducation.major}
                              onChange={(e) => setTempEducation({ ...tempEducation, major: e.target.value })}
                              placeholder="例如：计算机科学与技术"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>学位</Label>
                            <Input
                              value={tempEducation.degree || ''}
                              onChange={(e) => setTempEducation({ ...tempEducation, degree: e.target.value })}
                              placeholder="例如：工学学士"
                            />
                          </div>
                          <div className="space-y-2"></div>
                          <div className="space-y-2">
                            <Label>
                              开始日期 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="date"
                              value={tempEducation.startDate}
                              onChange={(e) => setTempEducation({ ...tempEducation, startDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>结束日期</Label>
                            <Input
                              type="date"
                              value={tempEducation.endDate || ''}
                              onChange={(e) => setTempEducation({ ...tempEducation, endDate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button type="button" variant="ghost" size="sm" onClick={cancelEducation}>
                            取消
                          </Button>
                          <Button type="button" size="sm" onClick={saveEducation}>
                            保存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 查看模式
                      <div className="p-4 flex items-start justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <GraduationCap className="h-5 w-5 text-blue-500" />
                            <h4 className="font-semibold text-gray-900">{edu.school}</h4>
                            {edu.degree && <span className="text-sm text-gray-600">· {edu.degree}</span>}
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{edu.major}</p>
                          <p className="text-xs text-gray-500">
                            {edu.startDate} {edu.endDate ? ` - ${edu.endDate}` : ' - 至今'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingEducation(index)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEducation(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 添加新教育经历的表单 */}
                {isAddingEducation && (
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">添加新教育经历</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          学校名称 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={tempEducation.school}
                          onChange={(e) => setTempEducation({ ...tempEducation, school: e.target.value })}
                          placeholder="例如：清华大学"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          专业 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={tempEducation.major}
                          onChange={(e) => setTempEducation({ ...tempEducation, major: e.target.value })}
                          placeholder="例如：计算机科学与技术"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>学位</Label>
                        <Input
                          value={tempEducation.degree || ''}
                          onChange={(e) => setTempEducation({ ...tempEducation, degree: e.target.value })}
                          placeholder="例如：工学学士"
                        />
                      </div>
                      <div className="space-y-2"></div>
                      <div className="space-y-2">
                        <Label>
                          开始日期 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={tempEducation.startDate}
                          onChange={(e) => setTempEducation({ ...tempEducation, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>结束日期</Label>
                        <Input
                          type="date"
                          value={tempEducation.endDate || ''}
                          onChange={(e) => setTempEducation({ ...tempEducation, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="ghost" size="sm" onClick={cancelEducation}>
                        取消
                      </Button>
                      <Button type="button" size="sm" onClick={saveEducation}>
                        保存
                      </Button>
                    </div>
                  </div>
                )}

                {/* 添加按钮 */}
                {!isAddingEducation && (
                  <Button type="button" variant="secondary" size="sm" onClick={startAddingEducation}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加教育经历
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 工作经历 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              工作经历
            </CardTitle>
            <CardDescription>添加候选人的工作经历信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.workExperience.length === 0 && !isAddingWork ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-3">暂无工作经历</p>
                <Button type="button" variant="secondary" size="sm" onClick={startAddingWork}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加工作经历
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 已添加的工作经历列表 */}
                {formData.workExperience.map((exp, index) => (
                  <div key={index} className="border rounded-lg">
                    {editingWorkIndex === index ? (
                      // 编辑模式 - 内联表单
                      <div className="p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              公司名称 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={tempWork.company}
                              onChange={(e) => setTempWork({ ...tempWork, company: e.target.value })}
                              placeholder="例如：腾讯游戏"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              职位 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={tempWork.position}
                              onChange={(e) => setTempWork({ ...tempWork, position: e.target.value })}
                              placeholder="例如：高级游戏开发工程师"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              开始日期 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="date"
                              value={tempWork.startDate}
                              onChange={(e) => setTempWork({ ...tempWork, startDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>结束日期</Label>
                            <Input
                              type="date"
                              value={tempWork.endDate || ''}
                              onChange={(e) => setTempWork({ ...tempWork, endDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>工作描述</Label>
                            <textarea
                              value={tempWork.description || ''}
                              onChange={(e) => setTempWork({ ...tempWork, description: e.target.value })}
                              placeholder="简要描述工作内容和职责..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button type="button" variant="ghost" size="sm" onClick={cancelWork}>
                            取消
                          </Button>
                          <Button type="button" size="sm" onClick={saveWork}>
                            保存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // 查看模式
                      <div className="p-4 flex items-start justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Briefcase className="h-5 w-5 text-green-500" />
                            <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                            <span className="text-sm text-gray-600">· {exp.company}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {exp.startDate} {exp.endDate ? ` - ${exp.endDate}` : ' - 至今'}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-700 line-clamp-2">{exp.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditingWork(index)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWork(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 添加新工作经历的表单 */}
                {isAddingWork && (
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">添加新工作经历</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          公司名称 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={tempWork.company}
                          onChange={(e) => setTempWork({ ...tempWork, company: e.target.value })}
                          placeholder="例如：腾讯游戏"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          职位 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={tempWork.position}
                          onChange={(e) => setTempWork({ ...tempWork, position: e.target.value })}
                          placeholder="例如：高级游戏开发工程师"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          开始日期 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={tempWork.startDate}
                          onChange={(e) => setTempWork({ ...tempWork, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>结束日期</Label>
                        <Input
                          type="date"
                          value={tempWork.endDate || ''}
                          onChange={(e) => setTempWork({ ...tempWork, endDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>工作描述</Label>
                        <textarea
                          value={tempWork.description || ''}
                          onChange={(e) => setTempWork({ ...tempWork, description: e.target.value })}
                          placeholder="简要描述工作内容和职责..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="ghost" size="sm" onClick={cancelWork}>
                        取消
                      </Button>
                      <Button type="button" size="sm" onClick={saveWork}>
                        保存
                      </Button>
                    </div>
                  </div>
                )}

                {/* 添加按钮 */}
                {!isAddingWork && (
                  <Button type="button" variant="secondary" size="sm" onClick={startAddingWork}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加工作经历
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 状态和来源 */}
        <Card>
          <CardHeader>
            <CardTitle>状态和来源</CardTitle>
            <CardDescription>设置候选人状态和来源信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">来源</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleChange('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 标签 */}
        <Card>
          <CardHeader>
            <CardTitle>标签</CardTitle>
            <CardDescription>添加候选人标签用于分类和筛选</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="输入标签后按回车或点击添加"
              />
              <Button type="button" onClick={handleAddTag} variant="secondary">
                <Plus className="h-4 w-4" />
                添加
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 备注 */}
        <Card>
          <CardHeader>
            <CardTitle>备注</CardTitle>
            <CardDescription>添加关于候选人的额外备注信息</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="在此输入备注信息..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/candidates')}
          >
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '提交中...' : isEditing ? '保存修改' : '创建候选人'}
          </Button>
        </div>
      </div>
    </form>
  );
}
