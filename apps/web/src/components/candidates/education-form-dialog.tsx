'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import { Textarea } from '@gametalent/ui';
import type { Education, SchoolType, EducationLevel } from '@/types/education';

interface EducationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  education?: Education;
  candidateId: string;
}

const schoolTypeOptions: { value: SchoolType; label: string }[] = [
  { value: 'UNDERGRADUATE', label: '本科' },
  { value: 'GRADUATE', label: '硕士' },
  { value: 'PHD', label: '博士' },
  { value: 'OVERSEAS', label: '海外' },
  { value: 'JUNIOR_COLLEGE', label: '大专' },
  { value: 'HIGH_SCHOOL', label: '高中' },
  { value: 'OTHER', label: '其他' },
];

const educationLevelOptions: { value: EducationLevel; label: string }[] = [
  { value: 'HIGH_SCHOOL', label: '高中' },
  { value: 'JUNIOR_COLLEGE', label: '大专' },
  { value: 'BACHELOR', label: '本科' },
  { value: 'MASTER', label: '硕士' },
  { value: 'PHD', label: '博士' },
  { value: 'POSTDOC', label: '博士后' },
  { value: 'OTHER', label: '其他' },
];

export function EducationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  education,
  candidateId,
}: EducationFormDialogProps) {
  const isEditing = !!education;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    school: education?.school || '',
    schoolType: education?.schoolType || 'UNDERGRADUATE',
    country: education?.country || '',
    province: education?.province || '',
    city: education?.city || '',
    major: education?.major || '',
    degree: education?.degree || '',
    level: education?.level || 'BACHELOR',
    isOverseas: education?.isOverseas || false,
    qsRanking: education?.qsRanking,
    theRanking: education?.theRanking,
    arwuRanking: education?.arwuRanking,
    startDate: education?.startDate ? education.startDate.split('T')[0] : '',
    endDate: education?.endDate ? education.endDate.split('T')[0] : '',
    gpa: education?.gpa,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        candidateId,
        gpa: formData.gpa ? Number(formData.gpa) : undefined,
        qsRanking: formData.qsRanking ? Number(formData.qsRanking) : undefined,
        theRanking: formData.theRanking ? Number(formData.theRanking) : undefined,
        arwuRanking: education?.arwuRanking ? Number(formData.arwuRanking) : undefined,
      };
      await onSubmit(data);
      onOpenChange(false);
      // 重置表单
      setFormData({
        school: '',
        schoolType: 'UNDERGRADUATE',
        country: '',
        province: '',
        city: '',
        major: '',
        degree: '',
        level: 'BACHELOR',
        isOverseas: false,
        qsRanking: undefined,
        theRanking: undefined,
        arwuRanking: undefined,
        startDate: '',
        endDate: '',
        gpa: undefined,
      });
    } catch (error) {
      console.error('提交教育经历失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑教育经历' : '添加教育经历'}</DialogTitle>
          <DialogDescription>
            {isEditing ? '修改教育经历信息' : '填写候选人的教育背景信息'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 学校基本信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">学校信息</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">
                  学校名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  placeholder="例如：清华大学"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolType">学校类型</Label>
                <Select
                  value={formData.schoolType}
                  onValueChange={(value) => setFormData({ ...formData, schoolType: value as SchoolType })}
                >
                  <SelectTrigger id="schoolType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">国家（海外学历）</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="例如：美国"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">省份（国内学历）</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="例如：北京"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="city">城市</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="例如：北京市海淀区"
                />
              </div>
            </div>
          </div>

          {/* 学位/专业信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">学位与专业</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="major">
                  专业 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  placeholder="例如：计算机科学与技术"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degree">学位名称</Label>
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="例如：工学学士"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">
                  学历层次 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value as EducationLevel })}
                >
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 海外学历排名 */}
          {(formData.country || formData.isOverseas) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">世界大学排名（可选）</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qsRanking">QS排名</Label>
                  <Input
                    id="qsRanking"
                    type="number"
                    value={formData.qsRanking || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      qsRanking: e.target.value ? Number(e.target.value) : undefined,
                    })}
                    placeholder="例如：1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theRanking">THE排名</Label>
                  <Input
                    id="theRanking"
                    type="number"
                    value={formData.theRanking || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      theRanking: e.target.value ? Number(e.target.value) : undefined,
                    })}
                    placeholder="例如：5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arwuRanking">ARWU排名</Label>
                  <Input
                    id="arwuRanking"
                    type="number"
                    value={formData.arwuRanking || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      arwuRanking: e.target.value ? Number(e.target.value) : undefined,
                    })}
                    placeholder="例如：10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 时间信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">就读时间</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  入学日期 <span className="text-red-500">*</span>
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
                <Label htmlFor="endDate">毕业日期</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* 补充信息 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">补充信息</h3>

            <div className="space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={formData.gpa || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  gpa: e.target.value ? Number(e.target.value) : undefined,
                })}
                placeholder="例如：3.5"
              />
            </div>
          </div>

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
