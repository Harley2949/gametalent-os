import { Card, CardContent } from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import {
  ArrowRight,
  Send,
  MessageSquare,
  Clock,
  Briefcase,
  XCircle,
  Archive,
  Star,
  FileText,
  MoreHorizontal,
  User,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import type { Candidate } from '@/types/candidate';

interface RightActionPanelProps {
  candidateId: string;
  candidate: Candidate;
  onStageChange?: (newStage: string) => void;
}

const stageColors: Record<string, string> = {
  初筛: 'bg-blue-100 text-blue-700 border-blue-200',
  面试: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Offer: 'bg-purple-100 text-purple-700 border-purple-200',
  录用: 'bg-green-100 text-green-700 border-green-200',
  淘汰: 'bg-red-100 text-red-700 border-red-200',
};

export function RightActionPanel({ candidateId, candidate, onStageChange }: RightActionPanelProps) {
  const router = useRouter();
  const [stage, setStage] = useState(candidate.stage || '初筛');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCommunicationForm, setShowCommunicationForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [communicationNote, setCommunicationNote] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (candidate.stage) {
      setStage(candidate.stage);
    }
  }, [candidate.stage]);

  const handleStageChange = (newStage: string) => {
    setStage(newStage);
    if (onStageChange) {
      onStageChange(newStage);
    }
  };

  // 推荐给用人部门
  const handleRecommendToDepartment = async () => {
    try {
      setNotification({ type: 'success', message: '推荐成功！已发送通知给用人部门' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: '推荐失败，请重试' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // 进入用人部门筛选
  const handleGoToFilter = () => {
    router.push(`/candidates?filter=recommended&candidateId=${candidateId}`);
  };

  // 标记沟通
  const handleMarkCommunication = async () => {
    if (!communicationNote.trim()) {
      setNotification({ type: 'error', message: '请输入沟通内容' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      // TODO: 调用后端 API 保存沟通记录
      console.log('保存沟通记录:', communicationNote);
      setNotification({ type: 'success', message: '沟通记录已保存' });
      setCommunicationNote('');
      setShowCommunicationForm(false);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: '保存失败，请重试' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // 添加标签
  const handleAddTag = async () => {
    if (!newTag.trim()) {
      setNotification({ type: 'error', message: '请输入标签内容' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      // TODO: 调用后端 API 添加标签
      console.log('添加标签:', newTag);
      const updatedTags = [...(candidate.tags || []), newTag.trim()];
      // 这里应该调用 API 更新候选人标签
      setNotification({ type: 'success', message: `标签 "${newTag}" 已添加` });
      setNewTag('');
      setShowTagForm(false);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: '添加标签失败，请重试' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const stages = ['初筛', '面试', 'Offer', '录用', '淘汰'];

  const quickActions = [
    { icon: ArrowRight, label: '进入用人部门筛选', color: 'text-gray-700' },
    { icon: Send, label: '推荐给用人部门', color: 'text-gray-700' },
    { icon: MessageSquare, label: '标记沟通', color: 'text-gray-700' },
    { icon: Clock, label: '跟进提醒', color: 'text-gray-700' },
    { icon: Briefcase, label: '推荐其他职位', color: 'text-gray-700' },
  ];

  const moreActions = [
    { icon: XCircle, label: '淘汰', color: 'text-red-600 hover:bg-red-50' },
    { icon: Archive, label: '放入人才库', color: 'text-gray-700 hover:bg-gray-50' },
    { icon: FileText, label: '备注', color: 'text-gray-700 hover:bg-gray-50' },
    { icon: MoreHorizontal, label: '更多', color: 'text-gray-700 hover:bg-gray-50' },
  ];

  return (
    <div className="space-y-4">
      {/* 流程阶段选择卡片 */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-900 mb-3 block">
              流程阶段
            </label>
            <div className="grid grid-cols-5 gap-1">
              {stages.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStageChange(s)}
                  className={`px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    stage === s
                      ? `${stageColors[s]} ring-2 ring-offset-1 ring-blue-500`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              当前阶段：<span className="font-medium text-gray-900">{stage}</span>
            </div>
          </div>

          {/* 通知提示 */}
          {notification && (
            <div
              className={`mb-3 p-3 rounded-lg text-sm ${
                notification.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* 快速操作按钮组 */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-700 mb-2">快速操作</div>

            {/* 进入用人部门筛选 */}
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
              size="sm"
              onClick={handleGoToFilter}
            >
              <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0" />
              进入用人部门筛选
            </Button>

            {/* 推荐给用人部门 */}
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
              size="sm"
              onClick={handleRecommendToDepartment}
            >
              <Send className="h-4 w-4 mr-2 flex-shrink-0" />
              推荐给用人部门
            </Button>

            {/* 标记沟通 */}
            {!showCommunicationForm ? (
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
                size="sm"
                onClick={() => setShowCommunicationForm(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                标记沟通
              </Button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={communicationNote}
                  onChange={(e) => setCommunicationNote(e.target.value)}
                  placeholder="记录沟通内容..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleMarkCommunication}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    保存
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setShowCommunicationForm(false);
                      setCommunicationNote('');
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    取消
                  </Button>
                </div>
              </div>
            )}

            {/* 跟进提醒 */}
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              跟进提醒
            </Button>

            {/* 推荐其他职位 */}
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-gray-700 hover:bg-gray-50"
              size="sm"
            >
              <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
              推荐其他职位
            </Button>
          </div>

          <div className="border-t border-gray-200 my-3"></div>

          {/* 更多操作 */}
          <div className="space-y-1">
            {moreActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                className={`w-full justify-start text-sm ${action.color}`}
                size="sm"
              >
                <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                {action.label}
              </Button>
            ))}
          </div>

          {/* 关注按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className={`w-full mt-2 ${
              isFollowing
                ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsFollowing(!isFollowing)}
          >
            <Star
              className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`}
            />
            {isFollowing ? '已关注' : '关注'}
          </Button>
        </CardContent>
      </Card>

      {/* 候选人所有者 */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1">候选人所有者</div>
              <div className="text-sm font-medium text-gray-900 truncate">
                系统管理员
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 自定义标签 */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Tag className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-2">自定义标签</div>

              {/* 现有标签 */}
              {(candidate.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {candidate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 添加标签按钮/表单 */}
              {!showTagForm ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-dashed border-gray-300"
                  onClick={() => setShowTagForm(true)}
                >
                  + 添加标签
                </Button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="输入新标签..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={handleAddTag}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      添加
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setShowTagForm(false);
                        setNewTag('');
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      取消
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
