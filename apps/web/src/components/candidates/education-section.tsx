'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import { GraduationCap, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { updateCandidate } from '@/lib/api';

interface Education {
  school: string;
  major: string;
  degree?: string;
  startDate: string;
  endDate?: string;
}

interface EducationSectionProps {
  candidateId: string;
  onUpdate: () => void;
}

export function EducationSection({ candidateId, onUpdate }: EducationSectionProps) {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // 临时表单数据
  const [tempEducation, setTempEducation] = useState<Education>({
    school: '',
    major: '',
    degree: '',
    startDate: '',
    endDate: '',
  });

  const startAdding = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setTempEducation({
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
    });
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempEducation({ ...educationList[index] });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setTempEducation({
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
    });
  };

  const saveEducation = async () => {
    if (!tempEducation.school || !tempEducation.major || !tempEducation.startDate) {
      alert('请填写必填字段（学校名称、专业、开始日期）');
      return;
    }

    const newList = [...educationList];

    if (editingIndex !== null) {
      // 编辑现有记录
      newList[editingIndex] = tempEducation;
    } else {
      // 添加新记录
      newList.push(tempEducation);
    }

    try {
      await updateCandidate(candidateId, { education: newList });
      setEducationList(newList);
      cancelEdit();
      onUpdate();
    } catch (error) {
      console.error('保存教育经历失败:', error);
      alert('保存失败，请重试');
    }
  };

  const deleteEducation = async (index: number) => {
    if (!confirm('确定要删除这条教育经历吗？')) return;

    const newList = educationList.filter((_, i) => i !== index);

    try {
      await updateCandidate(candidateId, { education: newList });
      setEducationList(newList);
      onUpdate();
    } catch (error) {
      console.error('删除教育经历失败:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            教育经历
          </CardTitle>
          <span className="text-sm text-gray-500">{educationList.length} 条</span>
        </div>
      </CardHeader>
      <CardContent>
        {educationList.length === 0 && !isAdding ? (
          /* 空状态 */
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-3">暂无教育经历</p>
            <Button variant="ghost" size="sm" onClick={startAdding} className="gap-2">
              <Plus className="h-4 w-4" />
              添加教育经历
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 教育经历列表 */}
            {educationList.map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                {editingIndex === index ? (
                  /* 编辑模式 - 内联表单 */
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          学校名称 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={tempEducation.school}
                          onChange={(e) =>
                            setTempEducation({ ...tempEducation, school: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：北京大学"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          专业 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={tempEducation.major}
                          onChange={(e) =>
                            setTempEducation({ ...tempEducation, major: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：计算机科学"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          学位
                        </label>
                        <input
                          type="text"
                          value={tempEducation.degree}
                          onChange={(e) =>
                            setTempEducation({ ...tempEducation, degree: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="例如：本科"
                        />
                      </div>
                      <div></div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          开始日期 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={tempEducation.startDate}
                          onChange={(e) =>
                            setTempEducation({ ...tempEducation, startDate: e.target.value })
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
                          value={tempEducation.endDate || ''}
                          onChange={(e) =>
                            setTempEducation({ ...tempEducation, endDate: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        取消
                      </Button>
                      <Button size="sm" onClick={saveEducation} className="bg-blue-600 hover:bg-blue-700">
                        保存
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 查看模式 */
                  <div className="p-4 flex items-start justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        <h4 className="text-sm font-semibold text-gray-900">{edu.school}</h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{edu.major}</p>
                      {edu.degree && <p className="text-xs text-gray-500 mb-1">{edu.degree}</p>}
                      <p className="text-xs text-gray-500">
                        {edu.startDate} {edu.endDate ? ` - ${edu.endDate}` : ' - 至今'}
                      </p>
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
                        onClick={() => deleteEducation(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 添加新教育经历表单 */}
            {isAdding && (
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      学校名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tempEducation.school}
                      onChange={(e) =>
                        setTempEducation({ ...tempEducation, school: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：北京大学"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      专业 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tempEducation.major}
                      onChange={(e) =>
                        setTempEducation({ ...tempEducation, major: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：计算机科学"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      学位
                    </label>
                    <input
                      type="text"
                      value={tempEducation.degree}
                      onChange={(e) =>
                        setTempEducation({ ...tempEducation, degree: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：本科"
                    />
                  </div>
                  <div></div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      开始日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tempEducation.startDate}
                      onChange={(e) =>
                        setTempEducation({ ...tempEducation, startDate: e.target.value })
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
                      value={tempEducation.endDate || ''}
                      onChange={(e) =>
                        setTempEducation({ ...tempEducation, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    取消
                  </Button>
                  <Button size="sm" onClick={saveEducation} className="bg-blue-600 hover:bg-blue-700">
                    保存
                  </Button>
                </div>
              </div>
            )}

            {/* 添加按钮（有数据时显示） */}
            {!isAdding && educationList.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startAdding}
                className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 gap-2"
              >
                <Plus className="h-4 w-4" />
                添加教育经历
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
