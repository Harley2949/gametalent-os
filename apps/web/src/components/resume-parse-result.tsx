'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@gametalent/ui';
import { Badge } from '@gametalent/ui';
import { Separator } from '@gametalent/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gametalent/ui';
import { Button } from '@gametalent/ui';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  GraduationCap,
  Code,
  Gamepad2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ParsedResume {
  name: string;
  email: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  skills?: {
    engines?: Array<{ name: string; level: string }>;
    languages?: Array<{ name: string; level: string }>;
    tools?: string[];
    gameGenres?: string[];
    artStyles?: string[];
  };
  projects?: Array<{
    name: string;
    role: string;
    status: string;
    platform?: string[];
    description: string;
  }>;
  workExperience?: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    major: string;
    level: string;
    isOverseas?: boolean;
  }>;
  warnings?: string[];
}

interface ResumeParseResultProps {
  resumeId: string;
  candidateId?: string;
}

export function ResumeParseResult({ resumeId, candidateId }: ResumeParseResultProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [isReparsing, setIsReparsing] = useState(false);

  useEffect(() => {
    fetchParseStatus();
  }, [resumeId]);

  const fetchParseStatus = async () => {
    try {
      const res = await fetch(`http://localhost:3006/api/resume-upload/status/${resumeId}`);
      const data = await res.json();

      if (data.success && data.data) {
        if (data.data.status === 'PARSING') {
          // 继续轮询
          setTimeout(fetchParseStatus, 2000);
        } else if (data.data.status === 'READY') {
          setParsedData(data.data.parsedData);
          setStatus('ready');
        } else if (data.data.status === 'ERROR') {
          setStatus('error');
        }
      }
    } catch (error) {
      console.error('获取解析状态失败:', error);
      setStatus('error');
    }
  };

  const handleReparse = async () => {
    setIsReparsing(true);
    try {
      const res = await fetch(`http://localhost:3006/api/resume-upload/reparse/${resumeId}`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (data.success) {
        setParsedData(data.data);
      }
    } catch (error) {
      console.error('重新解析失败:', error);
    } finally {
      setIsReparsing(false);
    }
  };

  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">AI 正在解析简历...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error' || !parsedData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600 mb-4">简历解析失败</p>
            <Button onClick={fetchParseStatus} variant="secondary">
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      expert: 'bg-purple-100 text-purple-800',
      advanced: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-green-100 text-green-800',
      basic: 'bg-gray-100 text-gray-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getProjectStatusBadge = (status: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      released: { label: '已上线', color: 'bg-green-100 text-green-800' },
      'in-development': { label: '在研', color: 'bg-blue-100 text-blue-800' },
      testing: { label: '测试中', color: 'bg-yellow-100 text-yellow-800' },
    };
    return labels[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{parsedData.name}</h2>
          <p className="text-gray-600">{parsedData.email}</p>
        </div>
        <Button
          onClick={handleReparse}
          disabled={isReparsing}
          variant="secondary"
          size="sm"
        >
          {isReparsing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              重新解析中...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              重新解析
            </>
          )}
        </Button>
      </div>

      {/* 警告信息 */}
      {parsedData.warnings && parsedData.warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">需要注意的问题</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  {parsedData.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="skills">技能</TabsTrigger>
          <TabsTrigger value="projects">项目</TabsTrigger>
          <TabsTrigger value="experience">工作经历</TabsTrigger>
          <TabsTrigger value="education">教育背景</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">姓名</p>
                  <p className="font-medium">{parsedData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">邮箱</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {parsedData.email}
                  </p>
                </div>
                {parsedData.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-500">手机</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {parsedData.phoneNumber}
                    </p>
                  </div>
                )}
                {parsedData.currentTitle && (
                  <div>
                    <p className="text-sm text-gray-500">当前职位</p>
                    <p className="font-medium">{parsedData.currentTitle}</p>
                  </div>
                )}
                {parsedData.currentCompany && (
                  <div>
                    <p className="text-sm text-gray-500">当前公司</p>
                    <p className="font-medium flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {parsedData.currentCompany}
                    </p>
                  </div>
                )}
                {parsedData.yearsOfExperience !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">工作年限</p>
                    <p className="font-medium">{parsedData.yearsOfExperience} 年</p>
                  </div>
                )}
              </div>

              {/* 社交链接 */}
              {(parsedData.linkedinUrl || parsedData.githubUrl) && (
                <>
                  <Separator />
                  <div className="flex gap-4">
                    {parsedData.linkedinUrl && (
                      <a
                        href={parsedData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {parsedData.githubUrl && (
                      <a
                        href={parsedData.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 技能 */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                技能清单
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 游戏引擎 */}
              {parsedData?.skills?.engines && parsedData.skills.engines.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">游戏引擎</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.engines.map((engine, i) => (
                      <Badge key={i} className={getLevelBadge(engine.level)}>
                        {engine.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 编程语言 */}
              {parsedData?.skills?.languages && parsedData.skills.languages.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">编程语言</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.languages.map((lang, i) => (
                      <Badge key={i} className={getLevelBadge(lang.level)}>
                        {lang.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 游戏品类 */}
              {parsedData?.skills?.gameGenres && parsedData.skills.gameGenres.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    游戏品类
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.gameGenres.map((genre, i) => (
                      <Badge key={i} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 美术风格 */}
              {parsedData?.skills?.artStyles && parsedData.skills.artStyles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">美术风格</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.artStyles.map((style, i) => (
                      <Badge key={i} variant="secondary">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 无数据提示 */}
              {(!parsedData?.skills ||
                (!parsedData.skills.engines?.length &&
                  !parsedData.skills.languages?.length &&
                  !parsedData.skills.gameGenres?.length &&
                  !parsedData.skills.artStyles?.length)) && (
                <div className="text-center py-8 text-gray-500">
                  暂无技能数据
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 项目经验 */}
        <TabsContent value="projects" className="space-y-4">
          {parsedData?.projects && parsedData.projects.length > 0 ? (
            parsedData.projects.map((project, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{project.name}</CardTitle>
                    <Badge className={getProjectStatusBadge(project.status).color}>
                      {getProjectStatusBadge(project.status).label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">担任角色</p>
                    <p className="font-medium">{project.role}</p>
                  </div>
                  {project.platform && project.platform.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">发布平台</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.platform.map((p, j) => (
                          <Badge key={j} variant="secondary">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">项目描述</p>
                    <p className="text-sm mt-1">{project.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                暂无项目数据
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 工作经历 */}
        <TabsContent value="experience" className="space-y-4">
          {parsedData?.workExperience && parsedData.workExperience.length > 0 ? (
            parsedData.workExperience.map((work, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    {work.title}
                    {work.isCurrent && (
                      <Badge className="bg-green-100 text-green-800">当前</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">公司</p>
                    <p className="font-medium">{work.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">工作时间</p>
                    <p className="text-sm">
                      {work.startDate} ~ {work.endDate || '至今'}
                    </p>
                  </div>
                  {work.description && (
                    <div>
                      <p className="text-sm text-gray-500">工作描述</p>
                      <p className="text-sm mt-1">{work.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                暂无工作经历数据
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 教育背景 */}
        <TabsContent value="education" className="space-y-4">
          {parsedData?.education && parsedData.education.length > 0 ? (
            parsedData.education.map((edu, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    {edu.school}
                    {edu.isOverseas && (
                      <Badge className="bg-purple-100 text-purple-800">海外</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">学位</p>
                      <p className="font-medium">{edu.degree}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">专业</p>
                      <p className="font-medium">{edu.major}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">学历层次</p>
                      <p className="font-medium">{edu.level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                暂无教育背景数据
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
