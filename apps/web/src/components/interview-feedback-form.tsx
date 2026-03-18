'use client';

import { useState } from 'react';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@gametalent/ui';
import { Textarea } from '@gametalent/ui';
import { Label } from '@gametalent/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Star, X, Plus } from 'lucide-react';
import { InterviewFeedbackDto } from '@/types/interview';

interface InterviewFeedbackFormProps {
  onSubmit: (data: InterviewFeedbackDto) => Promise<void>;
  existingFeedback?: any;
  isReadOnly?: boolean;
}

export function InterviewFeedbackForm({
  onSubmit,
  existingFeedback,
  isReadOnly = false,
}: InterviewFeedbackFormProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(existingFeedback?.score || 0);
  const [pros, setPros] = useState(existingFeedback?.pros || '');
  const [cons, setCons] = useState(existingFeedback?.cons || '');
  const [notes, setNotes] = useState(existingFeedback?.notes || '');
  const [tags, setTags] = useState<string[]>(existingFeedback?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        score,
        pros,
        cons,
        notes,
        tags,
      });
    } catch (error) {
      console.error('提交反馈失败:', error);
      toast.error('提交反馈失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const feedbackTags = [
    '技术能力强',
    '沟通能力强',
    '团队协作好',
    '学习能力强',
    '有潜力',
    '经验丰富',
    '态度积极',
    '需要提升',
    '缺乏经验',
    '技术不足',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 评分 */}
      <Card>
        <CardHeader>
          <CardTitle>面试评分</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Label>评分：</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && setScore(value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      value <= score
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">
              {score === 5 && '优秀'}
              {score === 4 && '良好'}
              {score === 3 && '一般'}
              {score === 2 && '较差'}
              {score === 1 && '很差'}
              {score === 0 && '未评分'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 优缺点 */}
      <Card>
        <CardHeader>
          <CardTitle>优缺点分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pros">优点</Label>
            <Textarea
              id="pros"
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="列出候选人的优点..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="cons">缺点</Label>
            <Textarea
              id="cons"
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="列出候选人的缺点..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* 详细备注 */}
      <Card>
        <CardHeader>
          <CardTitle>详细备注</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes">
            备注 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录面试过程中的详细观察和建议..."
            rows={6}
            required
            disabled={isReadOnly}
          />
        </CardContent>
      </Card>

      {/* 标签 */}
      <Card>
        <CardHeader>
          <CardTitle>评估标签</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isReadOnly && (
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="输入标签后按回车"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
          )}

          {/* 推荐标签 */}
          {!isReadOnly && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">推荐标签：</p>
              <div className="flex flex-wrap gap-2">
                {feedbackTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      if (!isReadOnly) {
                        if (tags.includes(tag)) {
                          removeTag(tag);
                        } else {
                          setTags([...tags, tag]);
                        }
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 已选标签 */}
          {tags.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">已选标签：</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      {!isReadOnly && (
        <div className="flex gap-4">
          <Button type="submit" disabled={submitting || score === 0}>
            {submitting ? '提交中...' : '提交反馈'}
          </Button>
        </div>
      )}
    </form>
  );
}
