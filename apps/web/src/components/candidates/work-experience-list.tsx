'use client';

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
import {
  Briefcase,
  Calendar,
  MapPin,
  Users,
  Building2,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { WorkExperienceFormDialog } from './work-experience-form-dialog';

import { fetchCandidateWorkExperience, deleteWorkExperience } from '@/lib/api';
import type { WorkExperience } from '@/types/work-experience';

interface WorkExperienceListProps {
  candidateId: string;
  onUpdate?: () => void;
}

export function WorkExperienceList({ candidateId, onUpdate }: WorkExperienceListProps) {
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkExperience | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadWorkExperiences();
  }, [candidateId]);

  const loadWorkExperiences = async () => {
    try {
      setLoading(true);
      const data = await fetchCandidateWorkExperience(candidateId);
      setWorkExperiences(data || []);
    } catch (error) {
      console.error('加载工作经历失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await fetch('/api/work-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      await loadWorkExperiences();
      onUpdate?.();
    } catch (error) {
      console.error('创建工作经历失败:', error);
      throw error;
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      if (!editingWork) return;

      await fetch(`/api/work-experience/${editingWork.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      await loadWorkExperiences();
      onUpdate?.();
    } catch (error) {
      console.error('更新工作经历失败:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteWorkExperience(deletingId);
      await loadWorkExperiences();
      onUpdate?.();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('删除工作经历失败:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingWork(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (work: WorkExperience) => {
    setEditingWork(work);
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

  const calculateDuration = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = new Date(startDate);
    const end = isCurrent ? new Date() : endDate ? new Date(endDate) : new Date();

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
                <Briefcase className="h-5 w-5" />
                工作经历
              </CardTitle>
              <CardDescription>候选人的职业发展历程</CardDescription>
            </div>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              添加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workExperiences.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无工作经历</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={openCreateDialog}>
                添加第一条工作经历
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workExperiences.map((work) => (
                <div
                  key={work.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{work.title}</h4>
                        {work.level && (
                          <Badge variant="secondary">{work.level}</Badge>
                        )}
                        {work.isCurrent && (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            在职
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-gray-900 font-medium mb-2">
                        <Building2 className="h-4 w-4" />
                        {work.companyName}
                        {work.department && ` · ${work.department}`}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(work.startDate)} - {formatDate(work.endDate)}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span>{calculateDuration(work.startDate, work.endDate, work.isCurrent)}</span>
                        </div>

                        {work.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{work.location}</span>
                          </div>
                        )}

                        {(work.teamSize || work.directReports !== undefined) && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {work.teamSize && `团队 ${work.teamSize} 人`}
                              {work.teamSize && work.directReports !== undefined && ' · '}
                              {work.directReports !== undefined && `下属 ${work.directReports} 人`}
                            </span>
                          </div>
                        )}
                      </div>

                      {work.description && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-700">{work.description}</p>
                        </div>
                      )}

                      {work.achievements && work.achievements.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">主要成就</p>
                          <ul className="space-y-1">
                            {work.achievements.map((achievement, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!work.isCurrent && work.leaveReason && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500">
                            离职原因: <span className="text-gray-700">{work.leaveReason}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(work)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(work.id)}
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

      <WorkExperienceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingWork ? handleUpdate : handleCreate}
        workExperience={editingWork}
        candidateId={candidateId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除工作经历</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条工作经历吗？此操作无法撤销。
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
