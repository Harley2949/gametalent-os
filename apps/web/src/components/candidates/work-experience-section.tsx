'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import { updateCandidate } from '@/lib/api';

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface WorkExperienceSectionProps {
  candidateId: string;
  onUpdate: () => void;
}

export function WorkExperienceSection({ candidateId, onUpdate }: WorkExperienceSectionProps) {
  const [workList, setWorkList] = useState<WorkExperience[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 临时表单数据
  const [tempWork, setTempWork] = useState<WorkExperience>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const startAdding = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setTempWork({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempWork({ ...workList[index] });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setTempWork({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const saveWork = async () => {
    if (!tempWork.company || !tempWork.position || !tempWork.startDate) {
      alert('请填写必填字段（公司名称、职位、开始日期）');
      return;
    }

    let newList = [...workList];

    if (editingIndex !== null) {
      // 编辑现有记录
      newList[editingIndex] = tempWork;
    } else {
      // 添加新记录
      newList.push(tempWork);
    }

    try {
      await updateCandidate(candidateId, { workExperience: newList });
      setWorkList(newList);
      cancelEdit();
      onUpdate();
    } catch (error) {
      console.error('保存工作经历失败:', error);
      alert('保存失败，请重试');
    }
  };

  const deleteWork = async (index: number) => {
    if (!confirm('确定要删除这条工作经历吗？')) return;

    const newList = workList.filter((_, i) => i !== index);

    try {
      await updateCandidate(candidateId, { workExperience: newList });
      setWorkList(newList);
      onUpdate();
    } catch (error) {
      console.error('删除工作经历失败:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            工作经历
          </CardTitle>
          <span className="text-sm text-gray-500">{workList.length} 条</span>
        </div>
      </CardHeader>
      <CardContent>
        {workList.length === 0 && !isAdding ? (
          /* 空状态 */
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-3">暂无工作经历</p>
            <Button variant="ghost" size="sm" onClick={startAdding} className="gap-2">
              <Plus className="h-4 w-4" />
              添加工作经历
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 工作经历列表 */}
            {workList.map((work, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                {editingIndex === index ? (
                  /* 编辑模式 - 内联表单 */
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          公司名称 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={tempWork.company}
                          onChange={(e) =>
                            setTempWork({ ...tempWork, company: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：腾讯游戏"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          职位 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={tempWork.position}
                          onChange={(e) =>
                            setTempWork({ ...tempWork, position: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：高级游戏开发工程师"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          开始日期 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={tempWork.startDate}
                          onChange={(e) =>
                            setTempWork({ ...tempWork, startDate: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          结束日期
                        </label>
                        <input
                          type="date"
                          value={tempWork.endDate || ''}
                          onChange={(e) =>
                            setTempWork({ ...tempWork, endDate: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          工作描述
                        </label>
                        <textarea
                          value={tempWork.description || ''}
                          onChange={(e) =>
                            setTempWork({ ...tempWork, description: e.target.value })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="描述工作职责和成就..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        取消
                      </Button>
                      <Button size="sm" onClick={saveWork} className="bg-blue-600 hover:bg-blue-700">
                        保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 查看模式 */
                  <div className="p-4 flex items-start justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                        <h4 className="text-sm font-semibold text-gray-900">{work.position}</h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{work.company}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        {work.startDate} {work.endDate ? ` - ${work.endDate}` : ' - 至今'}
                      </p>
                      {work.description && (
                        <p className="text-sm text-gray-600">{work.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(index)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWork(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 添加新工作经历表单 */}
            {isAdding && (
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      公司名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tempWork.company}
                      onChange={(e) => setTempWork({ ...tempWork, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：腾讯游戏"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      职位 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tempWork.position}
                      onChange={(e) => setTempWork({ ...tempWork, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：高级游戏开发工程师"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      开始日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tempWork.startDate}
                      onChange={(e) => setTempWork({ ...tempWork, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      结束日期
                    </label>
                    <input
                      type="date"
                      value={tempWork.endDate || ''}
                      onChange={(e) => setTempWork({ ...tempWork, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      工作描述
                    </label>
                    <textarea
                      value={tempWork.description || ''}
                      onChange={(e) => setTempWork({ ...tempWork, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="描述工作职责和成就..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    取消
                  </Button>
                  <Button size="sm" onClick={saveWork} className="bg-blue-600 hover:bg-blue-700">
                    保存
                  </Button>
                </div>
              </div>
            )}

            {/* 添加按钮（有数据时显示） */}
            {!isAdding && workList.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startAdding}
                className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 gap-2"
              >
                <Plus className="h-4 w-4" />
                添加工作经历
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
