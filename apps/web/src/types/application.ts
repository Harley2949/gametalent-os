// ============ 枚举类型 ============

export type ApplicationStatus =
  | 'APPLIED'
  | 'HR_INITIAL_CONTACT'
  | 'BUSINESS_SCREENING'
  | 'BUSINESS_FIRST_INTERVIEW'
  | 'BUSINESS_SECOND_INTERVIEW'
  | 'HR_FINAL_INTERVIEW'
  | 'CEO_INTERVIEW'
  | 'OFFER_PENDING'
  | 'PENDING_ONBOARDING'
  | 'HIRED'
  | 'ARCHIVED'
  | 'BLACKLISTED';

export type TransparencyLevel = 'STANDARD' | 'MINIMAL' | 'CUSTOM';

// ============ 显示标签 ============

export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  APPLIED: '已投递',
  HR_INITIAL_CONTACT: 'HR初步沟通',
  BUSINESS_SCREENING: '业务筛选中',
  BUSINESS_FIRST_INTERVIEW: '业务初面中',
  BUSINESS_SECOND_INTERVIEW: '业务复试中',
  HR_FINAL_INTERVIEW: 'HR终面',
  CEO_INTERVIEW: 'CEO面',
  OFFER_PENDING: 'Offer中',
  PENDING_ONBOARDING: '待入职',
  HIRED: '已入职',
  ARCHIVED: '已归档',
  BLACKLISTED: '黑名单',
};

export const TransparencyLevelLabels: Record<TransparencyLevel, string> = {
  STANDARD: '标准',
  MINIMAL: '最小',
  CUSTOM: '自定义',
};

// ============ 状态颜色 ============

export const ApplicationStatusColors: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-gray-100 text-gray-800',
  HR_INITIAL_CONTACT: 'bg-blue-100 text-blue-800',
  BUSINESS_SCREENING: 'bg-indigo-100 text-indigo-800',
  BUSINESS_FIRST_INTERVIEW: 'bg-purple-100 text-purple-800',
  BUSINESS_SECOND_INTERVIEW: 'bg-pink-100 text-pink-800',
  HR_FINAL_INTERVIEW: 'bg-cyan-100 text-cyan-800',
  CEO_INTERVIEW: 'bg-orange-100 text-orange-800',
  OFFER_PENDING: 'bg-green-100 text-green-800',
  PENDING_ONBOARDING: 'bg-teal-100 text-teal-800',
  HIRED: 'bg-emerald-100 text-emerald-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  BLACKLISTED: 'bg-red-100 text-red-800',
};

// ============ 流程顺序 ============

export const ApplicationStatusFlow: ApplicationStatus[] = [
  'APPLIED',
  'HR_INITIAL_CONTACT',
  'BUSINESS_SCREENING',
  'BUSINESS_FIRST_INTERVIEW',
  'BUSINESS_SECOND_INTERVIEW',
  'HR_FINAL_INTERVIEW',
  'CEO_INTERVIEW',
  'OFFER_PENDING',
  'PENDING_ONBOARDING',
  'HIRED',
];

// ============ 看板列配置（12列完整流程）============

export const KanbanColumns = [
  { status: 'APPLIED' as ApplicationStatus, label: '已投递', color: 'bg-gray-50' },
  { status: 'HR_INITIAL_CONTACT' as ApplicationStatus, label: 'HR初步沟通', color: 'bg-blue-50' },
  { status: 'BUSINESS_SCREENING' as ApplicationStatus, label: '业务筛选中', color: 'bg-indigo-50' },
  { status: 'BUSINESS_FIRST_INTERVIEW' as ApplicationStatus, label: '业务初面中', color: 'bg-purple-50' },
  { status: 'BUSINESS_SECOND_INTERVIEW' as ApplicationStatus, label: '业务复试中', color: 'bg-pink-50' },
  { status: 'HR_FINAL_INTERVIEW' as ApplicationStatus, label: 'HR终面', color: 'bg-cyan-50' },
  { status: 'CEO_INTERVIEW' as ApplicationStatus, label: 'CEO面', color: 'bg-orange-50' },
  { status: 'OFFER_PENDING' as ApplicationStatus, label: 'Offer中', color: 'bg-green-50' },
  { status: 'PENDING_ONBOARDING' as ApplicationStatus, label: '待入职', color: 'bg-teal-50' },
  { status: 'HIRED' as ApplicationStatus, label: '已入职', color: 'bg-emerald-50' },
  { status: 'ARCHIVED' as ApplicationStatus, label: '已归档', color: 'bg-gray-50' },
  { status: 'BLACKLISTED' as ApplicationStatus, label: '黑名单', color: 'bg-red-50' },
];

// ============ 数据模型 ============

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  transparencyLevel: TransparencyLevel;
  coverLetter?: string;
  source?: string;
  referralSource?: string;
  screeningScore?: number;
  screeningNotes?: string;
  screenedAt?: string;
  screenedBy?: string;
  matchScore?: number;
  matchDetails?: any;
  appliedAt: string;
  firstResponseAt?: string;
  lastContactAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  job?: ApplicationJob;
  candidate?: ApplicationCandidate;
  interviews?: ApplicationInterview[];
  feedback?: ApplicationFeedback[];
  offer?: ApplicationOffer;
}

export interface ApplicationJob {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  department?: string;
  status: string;
  type?: string;
  workMode?: string;
  experienceLevel?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
}

export interface ApplicationCandidate {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  status: string;
  location?: string;
  currentCompany?: string;
  currentTitle?: string;
  yearsOfExperience?: number;
  educationLevel?: string;
  school?: string;
  major?: string;
  graduationYear?: number;
  tags?: string[];
}

export interface ApplicationInterview {
  id: string;
  title?: string;
  description?: string;
  type: string;
  stage: string;
  status: string;
  scheduledAt?: string;
  duration?: number;
  location?: string;
  interviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApplicationFeedback {
  id: string;
  rating?: number;
  pros?: string;
  cons?: string;
  notes: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
  };
}

export interface ApplicationOffer {
  id: string;
  salary: number;
  bonus?: number;
  equity?: string;
  startDate?: string;
  status: string;
  sentAt?: string;
  acceptedAt?: string;
}

// ============ DTOs ============

export interface CreateApplicationDto {
  jobId: string;
  candidateId: string;
  coverLetter?: string;
  source?: string;
  referralSource?: string;
  transparencyLevel?: TransparencyLevel;
}

export interface UpdateApplicationDto {
  status?: ApplicationStatus;
  transparencyLevel?: TransparencyLevel;
  source?: string;
  referralSource?: string;
  screeningScore?: number;
  screeningNotes?: string;
  matchScore?: number;
  matchDetails?: any;
}

export interface ApplicationQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  jobId?: string;
  candidateId?: string;
  status?: ApplicationStatus;
  source?: string;
}

export interface UpdateStatusDto {
  status: ApplicationStatus;
  notes?: string;
}

export interface ScreenApplicationDto {
  screeningScore?: number;
  screeningNotes?: string;
  passed?: boolean;
}

// ============ 响应类型 ============

export interface ApplicationListResponse {
  data: Application[];
  total: number;
  page: number;
  pageSize: number;
}

export interface KanbanData {
  [status: string]: Application[];
}

export interface ApplicationStats {
  total: number;
  byStatus: Record<string, number>;
  todayApplied: number;
  thisWeekApplied: number;
  thisMonthApplied: number;
  averageResponseTime?: number;
  hireRate?: number;
}
