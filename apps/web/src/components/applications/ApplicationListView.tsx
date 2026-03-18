import { Card, CardContent } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import { Building2, Mail, Phone, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Application } from '@/types/application';

interface ApplicationListViewProps {
  applications: Application[];
  getCandidateName: (id: string) => string;
  getCandidateCompany: (id: string) => string;
  getJobTitle: (id: string) => string;
}

export function ApplicationListView({
  applications,
  getCandidateName,
  getCandidateCompany,
  getJobTitle,
}: ApplicationListViewProps) {
  const router = useRouter();

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          暂无应聘记录
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card
          key={application.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push(`/applications/${application.id}`)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">
                    {getCandidateName(application.candidateId)}
                  </h3>
                  <Badge className={`status-${application.status.toLowerCase()}`}>
                    {application.status === 'APPLIED' && '已投递'}
                    {application.status === 'HR_INITIAL_CONTACT' && 'HR初步沟通'}
                    {application.status === 'BUSINESS_SCREENING' && '业务筛选中'}
                    {application.status === 'BUSINESS_FIRST_INTERVIEW' && '业务初面中'}
                    {application.status === 'BUSINESS_SECOND_INTERVIEW' && '业务复试中'}
                    {application.status === 'HR_FINAL_INTERVIEW' && 'HR终面'}
                    {application.status === 'CEO_INTERVIEW' && 'CEO面'}
                    {application.status === 'OFFER_PENDING' && 'Offer中'}
                    {application.status === 'PENDING_ONBOARDING' && '待入职'}
                    {application.status === 'HIRED' && '已入职'}
                    {application.status === 'ARCHIVED' && '已归档'}
                    {application.status === 'BLACKLISTED' && '黑名单'}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>
                      {getCandidateCompany(application.candidateId)} →{' '}
                      {getJobTitle(application.jobId)}
                    </span>
                  </div>
                  {application.candidate?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{application.candidate.email}</span>
                    </div>
                  )}
                  {application.candidate?.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{application.candidate.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(application.appliedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>

                {application.matchScore && (
                  <div className="mt-3">
                    <Badge variant="secondary" className="text-green-600">
                      匹配度: {application.matchScore}%
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/applications/${application.id}`}>
                  <Button variant="ghost" size="sm">
                    查看详情
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
