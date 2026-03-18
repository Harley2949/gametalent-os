// 教育经历类型定义
export type SchoolType = 'UNDERGRADUATE' | 'GRADUATE' | 'PHD' | 'OVERSEAS' | 'JUNIOR_COLLEGE' | 'HIGH_SCHOOL' | 'OTHER';
export type EducationLevel = 'HIGH_SCHOOL' | 'JUNIOR_COLLEGE' | 'BACHELOR' | 'MASTER' | 'PHD' | 'POSTDOC' | 'OTHER';

export interface Education {
  id: string;
  candidateId: string;
  // 学校基本信息
  school: string;
  schoolType: SchoolType;
  country?: string;
  province?: string;
  city?: string;
  // 学位/专业信息
  major: string;
  degree?: string;
  level: EducationLevel;
  // 海外学历特定字段
  isOverseas?: boolean;
  qsRanking?: number;
  theRanking?: number;
  arwuRanking?: number;
  // 时间信息
  startDate: string;
  endDate?: string;
  // 补充信息
  gpa?: number;
  honors?: string[];
  courses?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEducationDto {
  candidateId: string;
  school: string;
  schoolType: SchoolType;
  country?: string;
  province?: string;
  city?: string;
  major: string;
  degree?: string;
  level: EducationLevel;
  isOverseas?: boolean;
  qsRanking?: number;
  theRanking?: number;
  arwuRanking?: number;
  startDate: string;
  endDate?: string;
  gpa?: number;
  honors?: string[];
  courses?: string[];
}

export interface UpdateEducationDto {
  school?: string;
  schoolType?: SchoolType;
  country?: string;
  province?: string;
  city?: string;
  major?: string;
  degree?: string;
  level?: EducationLevel;
  isOverseas?: boolean;
  qsRanking?: number;
  theRanking?: number;
  arwuRanking?: number;
  startDate?: string;
  endDate?: string;
  gpa?: number;
  honors?: string[];
  courses?: string[];
}
