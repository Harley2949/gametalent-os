'use client';

import { Button } from '@gametalent/ui';
import { Input } from '@gametalent/ui';
import { Textarea } from '@gametalent/ui';
import { Label } from '@gametalent/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '@/components/shared/Toast';
import {
  CreateJobDto,
  UpdateJobDto,
  JobType,
  WorkMode,
  ExperienceLevel,
  Priority,
  JobTypeLabels,
  WorkModeLabels,
  ExperienceLevelLabels,
  PriorityLabels,
} from '@/types/job';

interface JobFormProps {
  isEditing?: boolean;
  job?: any;
  onSubmit: (data: CreateJobDto | UpdateJobDto) => Promise<void>;
}

export function JobForm({ isEditing = false, job, onSubmit }: JobFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    title: job?.title || '',
    description: job?.description || '',
    requirements: job?.requirements || '',
    responsibilities: job?.responsibilities || '',
    type: job?.type || 'FULL_TIME',
    workMode: job?.workMode || 'ONSITE',
    experienceLevel: job?.experienceLevel || 'MID',
    priority: job?.priority || 'MEDIUM',
    salaryMin: job?.salaryMin || '',
    salaryMax: job?.salaryMax || '',
    salaryCurrency: job?.salaryCurrency || 'CNY',
    location: job?.location || '',
    remoteRegions: job?.remoteRegions || [],
    department: job?.department || '',
    team: job?.team || '',
    targetCompanies: job?.targetCompanies || [],
    targetSkills: job?.targetSkills || [],
  });

  // 标签输入状态
  const [remoteRegionInput, setRemoteRegionInput] = useState('');
  const [targetCompanyInput, setTargetCompanyInput] = useState('');
  const [targetSkillInput, setTargetSkillInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        type: formData.type as JobType,
        workMode: formData.workMode as WorkMode,
        experienceLevel: formData.experienceLevel as ExperienceLevel,
        priority: formData.priority as Priority,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        salaryCurrency: formData.salaryCurrency,
        location: formData.location || undefined,
        remoteRegions: formData.remoteRegions,
        department: formData.department,
        team: formData.team || undefined,
        targetCompanies: formData.targetCompanies,
        targetSkills: formData.targetSkills,
      };

      await onSubmit(data);
      router.push('/jobs');
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = (
    field: 'remoteRegions' | 'targetCompanies' | 'targetSkills',
    value: string,
    setInput: (value: string) => void
  ) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()],
      });
      setInput('');
    }
  };

  const removeTag = (
    field: 'remoteRegions' | 'targetCompanies' | 'targetSkills',
    value: string
  ) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((item: string) => item !== value),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">
              职位标题 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：高级游戏开发工程师"
              required
            />
          </div>

          <div>
            <Label htmlFor="department">
              部门 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="例如：技术部"
              required
            />
          </div>

          <div>
            <Label htmlFor="team">团队</Label>
            <Input
              id="team"
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              placeholder="例如：游戏引擎团队"
            />
          </div>
        </CardContent>
      </Card>

      {/* 职位详情 */}
      <Card>
        <CardHeader>
          <CardTitle>职位详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">
              职位描述 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="描述这个职位的职责和团队情况..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="responsibilities">
              工作职责 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="responsibilities"
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              placeholder="列出主要的工作职责..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="requirements">
              任职要求 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="列出技能、经验、学历等要求..."
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* 职位属性 */}
      <Card>
        <CardHeader>
          <CardTitle>职位属性</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">职位类型</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as JobType })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JobTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="workMode">工作模式</Label>
              <Select
                value={formData.workMode}
                onValueChange={(value) => setFormData({ ...formData, workMode: value as WorkMode })}
              >
                <SelectTrigger id="workMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WorkModeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experienceLevel">经验等级</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, experienceLevel: value as ExperienceLevel })
                }
              >
                <SelectTrigger id="experienceLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ExperienceLevelLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">优先级</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PriorityLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">工作地点</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="例如：北京、上海、深圳"
            />
          </div>

          {formData.workMode === 'REMOTE' || formData.workMode === 'HYBRID' ? (
            <div>
              <Label>远程地区</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={remoteRegionInput}
                  onChange={(e) => setRemoteRegionInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('remoteRegions', remoteRegionInput, setRemoteRegionInput);
                    }
                  }}
                  placeholder="输入地区后按回车"
                />
                <Button
                  type="button"
                  onClick={() => addTag('remoteRegions', remoteRegionInput, setRemoteRegionInput)}
                >
                  添加
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.remoteRegions.map((region: string) => (
                  <Badge key={region} variant="secondary">
                    {region}
                    <button
                      type="button"
                      onClick={() => removeTag('remoteRegions', region)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 薪资待遇 */}
      <Card>
        <CardHeader>
          <CardTitle>薪资待遇</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salaryMin">最低薪资</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                placeholder="例如：20000"
              />
            </div>

            <div>
              <Label htmlFor="salaryMax">最高薪资</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                placeholder="例如：35000"
              />
            </div>

            <div>
              <Label htmlFor="salaryCurrency">货币</Label>
              <Select
                value={formData.salaryCurrency}
                onValueChange={(value) => setFormData({ ...formData, salaryCurrency: value })}
              >
                <SelectTrigger id="salaryCurrency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                  <SelectItem value="USD">美元 (USD)</SelectItem>
                  <SelectItem value="EUR">欧元 (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 目标候选人 */}
      <Card>
        <CardHeader>
          <CardTitle>目标候选人</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>目标公司（竞品）</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={targetCompanyInput}
                onChange={(e) => setTargetCompanyInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('targetCompanies', targetCompanyInput, setTargetCompanyInput);
                  }
                }}
                placeholder="输入公司名后按回车"
              />
              <Button
                type="button"
                onClick={() => addTag('targetCompanies', targetCompanyInput, setTargetCompanyInput)}
              >
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetCompanies.map((company: string) => (
                <Badge key={company} variant="secondary">
                  {company}
                  <button
                    type="button"
                    onClick={() => removeTag('targetCompanies', company)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>目标技能</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={targetSkillInput}
                onChange={(e) => setTargetSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('targetSkills', targetSkillInput, setTargetSkillInput);
                  }
                }}
                placeholder="输入技能后按回车"
              />
              <Button
                type="button"
                onClick={() => addTag('targetSkills', targetSkillInput, setTargetSkillInput)}
              >
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetSkills.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeTag('targetSkills', skill)}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮卡片 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={submitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '提交中...' : isEditing ? '保存更改' : '创建职位'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
