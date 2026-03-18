// Job Enums
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type WorkMode = 'ONSITE' | 'HYBRID' | 'REMOTE';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Job Display Labels
export const JobStatusLabels: Record<JobStatus, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  CLOSED: '已关闭',
  ARCHIVED: '已归档',
};

export const JobTypeLabels: Record<JobType, string> = {
  FULL_TIME: '全职',
  PART_TIME: '兼职',
  CONTRACT: '合同工',
  INTERNSHIP: '实习',
};

export const WorkModeLabels: Record<WorkMode, string> = {
  ONSITE: '现场办公',
  HYBRID: '混合办公',
  REMOTE: '远程办公',
};

export const ExperienceLevelLabels: Record<ExperienceLevel, string> = {
  ENTRY: '初级',
  MID: '中级',
  SENIOR: '高级',
  LEAD: '专家',
  PRINCIPAL: '首席',
};

export const PriorityLabels: Record<Priority, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '紧急',
};

// Job Interfaces
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  status: JobStatus;
  type: JobType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  priority: Priority;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  location?: string;
  remoteRegions: string[];
  department: string;
  team?: string;
  targetCompanies: string[];
  targetSkills: string[];
  applicantCount: number;
  interviewCount: number;
  offerCount: number;
  publishedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  assignees: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  _count: {
    applications: number;
  };
}

export interface JobListResponse {
  data: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateJobDto {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  type?: JobType;
  workMode?: WorkMode;
  experienceLevel: ExperienceLevel;
  priority?: Priority;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  location?: string;
  remoteRegions?: string[];
  department: string;
  team?: string;
  targetCompanies?: string[];
  targetSkills?: string[];
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  status?: JobStatus;
  type?: JobType;
  workMode?: WorkMode;
  experienceLevel?: ExperienceLevel;
  priority?: Priority;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  location?: string;
  remoteRegions?: string[];
  department?: string;
  team?: string;
  targetCompanies?: string[];
  targetSkills?: string[];
  applicantCount?: number;
  interviewCount?: number;
  offerCount?: number;
}

export interface JobQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: JobStatus;
  department?: string;
  experienceLevel?: ExperienceLevel;
  priority?: Priority;
}
