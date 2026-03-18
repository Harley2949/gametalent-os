import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import type { Candidate } from '@/types/candidate';

interface ContactInfoCardProps {
  candidate: Candidate;
}

export function ContactInfoCard({ candidate }: ContactInfoCardProps) {
  const contactItems = [
    {
      icon: Mail,
      label: '邮箱',
      value: candidate.email,
      href: `mailto:${candidate.email}`,
      show: !!candidate.email,
    },
    {
      icon: Phone,
      label: '手机',
      value: candidate.phoneNumber,
      href: `tel:${candidate.phoneNumber}`,
      show: !!candidate.phoneNumber,
    },
    {
      icon: MapPin,
      label: '所在地',
      value: candidate.location,
      show: !!candidate.location,
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'LinkedIn',
      href: candidate.linkedinUrl,
      show: !!candidate.linkedinUrl,
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'GitHub',
      href: candidate.githubUrl,
      show: !!candidate.githubUrl,
    },
    {
      icon: Globe,
      label: '作品集',
      value: '作品集',
      href: candidate.portfolioUrl,
      show: !!candidate.portfolioUrl,
    },
  ];

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">联系方式</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contactItems.filter(item => item.show).map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  {item.value}
                </a>
              ) : (
                <span className="text-gray-700 text-sm">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
