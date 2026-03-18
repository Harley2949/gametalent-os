'use client';

import { Button } from '@gametalent/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@gametalent/ui';
import { Input } from '@gametalent/ui';
import { Label } from '@gametalent/ui';
import { Textarea } from '@gametalent/ui';
import { Switch } from '@gametalent/ui';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

import type { WorkExperience } from '@/types/work-experience';

interface WorkExperienceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  workExperience?: WorkExperience;
  candidateId: string;
}

export function WorkExperienceFormDialog({
  open,
  onOpenChange,
  onSubmit,
  workExperience,
  candidateId,
}: WorkExperienceFormDialogProps) {
  const isEditing = !!workExperience;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: workExperience?.companyName || '',
    title: workExperience?.title || '',
    level: workExperience?.level || '',
    department: workExperience?.department || '',
    startDate: workExperience?.startDate ? workExperience.startDate.split('T')[0] : '',
    endDate: workExperience?.endDate ? workExperience.endDate.split('T')[0] : '',
    isCurrent: workExperience?.isCurrent || false,
    location: workExperience?.location || '',
    description: workExperience?.description || '',
    achievements: workExperience?.achievements || [],
    teamSize: workExperience?.teamSize,
    directReports: workExperience?.directReports,
    leaveReason: workExperience?.leaveReason || '',
  });
  const [newAchievement, setNewAchievement] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        candidateId,
        teamSize: formData.teamSize ? Number(formData.teamSize) : undefined,
        directReports: formData.directReports ? Number(formData.directReports) : undefined,
      };
      await onSubmit(data);
      onOpenChange(false);
      // 重置表单
      setFormData({
        companyName: '',
        title: '',
        level: '',
        department: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        location: '',
        description: '',
        achievements: [],
        teamSize: undefined,
        directReports: undefined,
        leaveReason: '',
      });
      setNewAchievement('');
    } catch (error) {
      console.error('提交工作经历失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement.trim()],
      });
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAchievement();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑工作经历' : '添加工作经历'}</DialogTitle>
          <DialogDescription>
            {isEditing ? '修改工作经历信息' : '填写候选人的工作经历'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 公司和职位信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">公司和职位</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  公司名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="例如：腾讯游戏"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  职位 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：高级游戏开发工程师"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">职级</Label>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="例如：T8、P7"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">部门</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="例如：技术部"
                />
              </div>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">工作时间</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  开始日期 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">结束日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isCurrent}
                />
                {formData.isCurrent && (
                  <p className="text-xs text-gray-500">在职中无需填写结束日期</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isCurrent"
                    checked={formData.isCurrent}
                    onCheckedChange={(checked) => setFormData({ ...formData, isCurrent: checked })}
                  />
                  <Label htmlFor="isCurrent" className="cursor-pointer">
                    目前在职
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* 工作详情 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">工作详情</h3>

            <div className="space-y-2">
              <Label htmlFor="location">工作地点</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="例如：北京·上海"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">工作描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简要描述工作内容和职责..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>主要成就</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入成就，按回车添加"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addAchievement}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.achievements.length > 0 && (
                  <div className="space-y-1">
                    {formData.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{achievement}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAchievement(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 团队信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">团队信息</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamSize">团队规模</Label>
                <Input
                  id="teamSize"
                  type="number"
                  min="1"
                  value={formData.teamSize || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    teamSize: e.target.value ? Number(e.target.value) : undefined,
                  })}
                  placeholder="例如：10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="directReports">直属下属人数</Label>
                <Input
                  id="directReports"
                  type="number"
                  min="0"
                  value={formData.directReports || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    directReports: e.target.value ? Number(e.target.value) : undefined,
                  })}
                  placeholder="例如：3"
                />
              </div>
            </div>
          </div>

          {/* 离职信息 */}
          {!formData.isCurrent && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">离职信息</h3>

              <div className="space-y-2">
                <Label htmlFor="leaveReason">离职原因</Label>
                <Textarea
                  id="leaveReason"
                  value={formData.leaveReason}
                  onChange={(e) => setFormData({ ...formData, leaveReason: e.target.value })}
                  placeholder="简要说明离职原因..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '提交中...' : isEditing ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
