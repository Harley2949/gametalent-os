import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Briefcase, DollarSign, Calendar } from 'lucide-react';

import type { Candidate } from '@/types/candidate';

interface CareerInfoCardProps {
  candidate: Candidate;
}

export function CareerInfoCard({ candidate }: CareerInfoCardProps) {
  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">职业信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 工作年限 */}
          <div className="flex items-start gap-3">
            <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-gray-500 mb-1">工作年限</div>
              <div className="text-gray-900 text-sm">
                {candidate.yearsOfExperience ? `${candidate.yearsOfExperience} 年` : '未填写'}
              </div>
            </div>
          </div>

          {/* 期望薪资 */}
          {candidate.expectedSalary && (
            <div className="flex items-start gap-3">
              <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500 mb-1">期望薪资</div>
                <div className="text-gray-900 text-sm">{candidate.expectedSalary}</div>
              </div>
            </div>
          )}

          {/* 离职通知期 */}
          {candidate.noticePeriod && (
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500 mb-1">离职通知期</div>
                <div className="text-gray-900 text-sm">{candidate.noticePeriod}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
