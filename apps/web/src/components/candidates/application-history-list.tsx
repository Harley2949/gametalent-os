import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import { Briefcase, Calendar, Building2 } from 'lucide-react';
import Link from 'next/link';

interface ApplicationHistoryListProps {
  applications?: any[];
}

export function ApplicationHistoryList({ applications = [] }: ApplicationHistoryListProps) {
  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">应聘记录</CardTitle>
          <span className="text-sm text-gray-500">{applications.length} 条</span>
        </div>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((application: any) => (
              <div
                key={application.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      {application.job?.title || '未知职位'}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {application.job?.department && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {application.job.department}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(application.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {application.status && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                      {application.status}
                    </span>
                  )}

                  <Link href={`/applications/${application.id}`}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      查看详情
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">暂无应聘记录</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
