'use client';

import { useState, useEffect } from 'react';
import { Button } from '@gametalent/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@gametalent/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { GraduationCap, Calendar, MapPin, Trophy, Plus, Trash2, Edit } from 'lucide-react';
import { fetchCandidateEducation, deleteEducation } from '@/lib/api';
import type { Education } from '@/types/education';
import { EducationFormDialog } from './education-form-dialog';

interface EducationListProps {
  candidateId: string;
  onUpdate?: () => void;
}

const schoolTypeMap: Record<string, string> = {
  UNDERGRADUATE: '本科',
  GRADUATE: '硕士',
  PHD: '博士',
  OVERSEAS: '海外',
  JUNIOR_COLLEGE: '大专',
  HIGH_SCHOOL: '高中',
  OTHER: '其他',
};

const educationLevelMap: Record<string, string> = {
  HIGH_SCHOOL: '高中',
  JUNIOR_COLLEGE: '大专',
  BACHELOR: '本科',
  MASTER: '硕士',
  PHD: '博士',
  POSTDOC: '博士后',
  OTHER: '其他',
};

export function EducationList({ candidateId, onUpdate }: EducationListProps) {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadEducations();
  }, [candidateId]);

  const loadEducations = async () => {
    try {
      setLoading(true);
      const data = await fetchCandidateEducation(candidateId);
      setEducations(data || []);
    } catch (error) {
      console.error('加载教育经历失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      // 由于API函数需要包含candidateId，这里确保它存在
      await fetch('/api/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      await loadEducations();
      onUpdate?.();
    } catch (error) {
      console.error('创建教育经历失败:', error);
      throw error;
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      if (!editingEducation) return;

      await fetch(`/api/education/${editingEducation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      await loadEducations();
      onUpdate?.();
    } catch (error) {
      console.error('更新教育经历失败:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteEducation(deletingId);
      await loadEducations();
      onUpdate?.();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('删除教育经历失败:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingEducation(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (education: Education) => {
    setEditingEducation(education);
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '至今';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    });
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();

    const totalMonths = years * 12 + months;

    if (totalMonths < 12) {
      return `${totalMonths}个月`;
    }

    const yearCount = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    return remainingMonths > 0
      ? `${yearCount}年${remainingMonths}个月`
      : `${yearCount}年`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 py-8">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                教育经历
              </CardTitle>
              <CardDescription>候选人的学历和教育背景</CardDescription>
            </div>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              添加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {educations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无教育经历</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={openCreateDialog}>
                添加第一条教育经历
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {educations.map((education) => (
                <div
                  key={education.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{education.school}</h4>
                        <Badge variant="secondary">
                          {schoolTypeMap[education.schoolType] || education.schoolType}
                        </Badge>
                        {education.isOverseas && (
                          <Badge className="bg-blue-100 text-blue-800">海外学历</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>
                            <span className="font-medium text-gray-900">{education.major}</span>
                            {education.degree && ` · ${education.degree}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {educationLevelMap[education.level] || education.level}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(education.startDate)} - {formatDate(education.endDate)}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span>{calculateDuration(education.startDate, education.endDate)}</span>
                        </div>

                        {(education.city || education.province || education.country) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {[education.country, education.province, education.city]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </div>
                        )}

                        {education.gpa && (
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            <span>GPA: <span className="font-medium text-gray-900">{education.gpa}</span></span>
                          </div>
                        )}

                        {(education.qsRanking || education.theRanking || education.arwuRanking) && (
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            <span>
                              世界排名：{' '}
                              {education.qsRanking && `QS ${education.qsRanking}`}
                              {education.qsRanking && education.theRanking && ' · '}
                              {education.theRanking && `THE ${education.theRanking}`}
                              {(education.qsRanking || education.theRanking) && education.arwuRanking && ' · '}
                              {education.arwuRanking && `ARWU ${education.arwuRanking}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {education.honors && education.honors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">荣誉奖项</p>
                          <div className="flex flex-wrap gap-2">
                            {education.honors.map((honor, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {honor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(education)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(education.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EducationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingEducation ? handleUpdate : handleCreate}
        education={editingEducation}
        candidateId={candidateId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除教育经历</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条教育经历吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
