import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { FileText, Download } from 'lucide-react';
import { Button } from '@gametalent/ui';

interface ResumeCardProps {
  resumes?: any[];
}

export function ResumeCard({ resumes = [] }: ResumeCardProps) {
  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">简历</CardTitle>
          <span className="text-sm text-gray-500">{resumes.length} 份</span>
        </div>
      </CardHeader>
      <CardContent>
        {resumes.length > 0 ? (
          <div className="space-y-2">
            {resumes.map((resume: any) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {resume.fileName || '未命名简历'}
                    </p>
                    <p className="text-xs text-gray-500">
                      上传于 {new Date(resume.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  下载
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">暂无简历</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
