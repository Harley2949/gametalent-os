// 工作经历类型定义
export interface WorkExperience {
  id: string;
  candidateId: string;
  // 公司信息
  companyId?: string;
  companyName: string;
  // 职位信息
  title: string;
  level?: string;
  department?: string;
  // 时间信息
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  // 工作详情
  location?: string;
  description?: string;
  achievements?: string[];
  // 团队信息
  teamSize?: number;
  directReports?: number;
  // 离职原因
  leaveReason?: string;
  // 创建和更新时间
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkExperienceDto {
  candidateId: string;
  companyId?: string;
  companyName: string;
  title: string;
  level?: string;
  department?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  description?: string;
  achievements?: string[];
  teamSize?: number;
  directReports?: number;
  leaveReason?: string;
}

export interface UpdateWorkExperienceDto {
  companyId?: string;
  companyName?: string;
  title?: string;
  level?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  location?: string;
  description?: string;
  achievements?: string[];
  teamSize?: number;
  directReports?: number;
  leaveReason?: string;
}
