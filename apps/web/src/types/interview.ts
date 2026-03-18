// Interview Enums
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type InterviewType = 'PHONE_SCREEN' | 'VIDEO' | 'ONSITE' | 'TECHNICAL' | 'BEHAVIORAL' | 'PANEL' | 'TAKE_HOME';
export type InterviewStage = 'SCREENING' | 'FIRST_ROUND' | 'SECOND_ROUND' | 'FINAL_ROUND' | 'TECHNICAL' | 'CULTURAL' | 'EXECUTIVE';

// Interview Display Labels
export const InterviewStatusLabels: Record<InterviewStatus, string> = {
  SCHEDULED: '已安排',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  NO_SHOW: '未出席',
};

export const InterviewTypeLabels: Record<InterviewType, string> = {
  PHONE_SCREEN: '电话筛选',
  VIDEO: '视频面试',
  ONSITE: '现场面试',
  TECHNICAL: '技术面试',
  BEHAVIORAL: '行为面试',
  PANEL: '小组面试',
  TAKE_HOME: '作业测试',
};

export const InterviewStageLabels: Record<InterviewStage, string> = {
  SCREENING: '筛选',
  FIRST_ROUND: '初试',
  SECOND_ROUND: '复试',
  FINAL_ROUND: '终面',
  TECHNICAL: '技术面',
  CULTURAL: '文化面',
  EXECUTIVE: '高管面',
};

// Interview Interfaces
export interface Interview {
  id: string;
  applicationId: string;
  interviewerId: string;
  title: string;
  description?: string;
  status: InterviewStatus;
  type: InterviewType;
  stage: InterviewStage;
  scheduledAt: string;
  duration: number;
  location?: string;
  score?: number;
  notes?: string;
  feedback?: any;
  nextSteps?: string;
  followUpAt?: string;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    candidate?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    job?: {
      id: string;
      title: string;
      department: string;
    };
  };
  interviewer?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  candidateName: string;
  jobTitle: string;
  stage: InterviewStage;
  status: InterviewStatus;
}

export interface InterviewListResponse {
  data: Interview[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateInterviewDto {
  applicationId: string;
  interviewerId: string;
  title: string;
  description?: string;
  type: InterviewType;
  stage: InterviewStage;
  scheduledAt: string;
  duration: number;
  location?: string;
}

export interface UpdateInterviewDto {
  title?: string;
  description?: string;
  status?: InterviewStatus;
  scheduledAt?: string;
  duration?: number;
  location?: string;
  score?: number;
  notes?: string;
  feedback?: any;
  nextSteps?: string;
  followUpAt?: string;
}

export interface InterviewFeedbackDto {
  score: number;
  pros?: string;
  cons?: string;
  notes: string;
  tags?: string[];
}

export interface InterviewQueryParams {
  page?: number;
  pageSize?: number;
  applicationId?: string;
  interviewerId?: string;
  status?: InterviewStatus;
  stage?: InterviewStage;
  startDate?: string;
  endDate?: string;
}
