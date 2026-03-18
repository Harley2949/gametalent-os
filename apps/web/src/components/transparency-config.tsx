'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Switch } from '@gametalent/ui';
import { Label } from '@gametalent/ui';

type TransparencyMode = 'standard' | 'minimal' | 'custom';

interface TransparencyConfig {
  mode: TransparencyMode;
  showDetailedStatus: boolean;
  showNextSteps: boolean;
  showInterviewPrep: boolean;
  showInternalFeedback: boolean;
  anonymizeInterviewers: boolean;
  customFields?: string[];
}

export function TransparencyConfig({ jobId }: { jobId: string }) {
  const [config, setConfig] = useState<TransparencyConfig>({
    mode: 'standard',
    showDetailedStatus: true,
    showNextSteps: true,
    showInterviewPrep: true,
    showInternalFeedback: false,
    anonymizeInterviewers: false,
  });

  const [saving, setSaving] = useState(false);

  const modeConfigs = {
    standard: {
      label: '标准模式',
      description: '适用于校招、初级/中级社招，提升候选人体验',
      badge: '推荐校招',
      settings: {
        showDetailedStatus: true,
        showNextSteps: true,
        showInterviewPrep: true,
        showInternalFeedback: false,
        anonymizeInterviewers: false,
      },
    },
    minimal: {
      label: '极简模式',
      description: '适用于高管猎聘、核心技术专家',
      badge: '高端招聘',
      settings: {
        showDetailedStatus: false,
        showNextSteps: false,
        showInterviewPrep: false,
        showInternalFeedback: false,
        anonymizeInterviewers: true,
      },
    },
    custom: {
      label: '自定义模式',
      description: '手动配置每个选项',
      badge: '灵活配置',
      settings: null,
    },
  };

  const handleModeChange = (mode: TransparencyMode) => {
    const modeConfig = modeConfigs[mode];
    if (modeConfig.settings) {
      setConfig({ ...config, mode, ...modeConfig.settings });
    } else {
      setConfig({ ...config, mode });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/jobs/${jobId}/transparency`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>候选人透明度配置</CardTitle>
        <CardDescription>
          配置候选人在招聘流程中能看到的信息范围
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 模式选择 */}
        <div className="space-y-3">
          <Label>选择透明度模式</Label>
          <div className="grid grid-cols-3 gap-4">
            {(Object.keys(modeConfigs) as TransparencyMode[]).map((mode) => {
              const modeConfig = modeConfigs[mode];
              return (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    config.mode === mode
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{modeConfig.label}</span>
                    {modeConfig.badge && (
                      <Badge variant="secondary">{modeConfig.badge}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{modeConfig.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 自定义选项 */}
        {config.mode === 'custom' && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">自定义选项</h4>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="detailed-status">显示详细流程状态</Label>
                <p className="text-sm text-gray-500">
                  候选人可以看到每个流程节点的详细状态
                </p>
              </div>
              <Switch
                id="detailed-status"
                checked={config.showDetailedStatus}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, showDetailedStatus: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="next-steps">显示下一步引导</Label>
                <p className="text-sm text-gray-500">
                  显示每个节点后的下一步操作提示
                </p>
              </div>
              <Switch
                id="next-steps"
                checked={config.showNextSteps}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, showNextSteps: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="interview-prep">推送面试准备材料</Label>
                <p className="text-sm text-gray-500">
                  自动发送面试官介绍、团队介绍等准备材料
                </p>
              </div>
              <Switch
                id="interview-prep"
                checked={config.showInterviewPrep}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, showInterviewPrep: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="anonymize">面试官匿名</Label>
                <p className="text-sm text-gray-500">
                  隐藏面试官真实姓名，仅显示职位
                </p>
              </div>
              <Switch
                id="anonymize"
                checked={config.anonymizeInterviewers}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, anonymizeInterviewers: checked })
                }
              />
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存配置'}
        </Button>
      </CardContent>
    </Card>
  );
}
