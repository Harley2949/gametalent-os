'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Avatar } from '@gametalent/ui';

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
  interviewers: string[];
}

interface InterviewSchedulerProps {
  candidateId: string;
  jobId: string;
  round: number;
  duration: number; // 分钟
  interviewerIds: string[];
}

export function InterviewScheduler({
  candidateId,
  jobId,
  round,
  duration,
  interviewerIds,
}: InterviewSchedulerProps) {
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [candidateName, setCandidateName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    fetchRecommendedSlots();
    fetchCandidateInfo();
  }, [interviewerIds, duration]);

  const fetchRecommendedSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interviews/recommend-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerIds,
          duration,
          candidateId,
        }),
      });
      const data = await res.json();
      setTimeSlots(data.slots);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateInfo = async () => {
    const res = await fetch(`/api/candidates/${candidateId}`);
    const data = await res.json();
    setCandidateName(data.name);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;

    await fetch('/api/interviews/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId,
        jobId,
        round,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        interviewerIds,
      }),
    });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          面试排期 - 第 {round} 轮
          {candidateName && <span className="ml-2">候选人: {candidateName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            <p className="mt-2 text-gray-600">正在协调面试官时间...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              基于所有面试官的空闲时间和候选人的偏好，系统推荐以下时段：
            </p>

            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedSlot?.id === slot.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {index === 0 && (
                          <Badge variant="default">推荐</Badge>
                        )}
                        <span className="font-semibold">
                          {formatDate(slot.startTime)}
                        </span>
                      </div>
                      <p className="text-lg">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </p>
                    </div>
                    <div className="flex -space-x-2">
                      {slot.interviewers.map((id) => (
                        <Avatar key={id} className="w-8 h-8 border-2 border-white">
                          <img src={`/api/users/${id}/avatar`} alt="" />
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  {!slot.available && (
                    <p className="text-sm text-amber-600 mt-2">
                      ⚠️ 部分面试官需要调整其他会议
                    </p>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConfirm}
                disabled={!selectedSlot}
                className="flex-1"
              >
                确认并发送邀请
              </Button>
              <Button variant="ghost" className="flex-1">
                手动选择时间
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
