// 职位匹配类型定义
export interface JobMatch {
  id: string;
  candidateId: string;
  jobId: string;
  matchScore: number;
  candidate?: {
    id: string;
    name: string;
    currentCompany?: string;
    currentTitle?: string;
  };
  matchDetails?: {
    skillsMatch?: number;
    experienceMatch?: number;
    educationMatch?: number;
    locationMatch?: boolean;
    salaryMatch?: boolean;
    cultureMatch?: number;
    reasoning?: string;
    strengths?: string[];
    gaps?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CalculateMatchDto {
  candidateId: string;
  jobId: string;
}

export interface BatchCalculateMatchDto {
  jobId: string;
  candidateIds: string[];
}

export interface MatchStatistics {
  jobId: string;
  totalMatches: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number; // 90+
    good: number;      // 75-89
    fair: number;      // 60-74
    poor: number;      // <60
  };
  topMatches: JobMatch[];
}

export interface SkillsExtractionResult {
  resumeId: string;
  skills: string[];
  experience?: string;
  education?: string;
}

export interface CompetitorAnalysisResult {
  resumeId: string;
  targetCompanies: string[];
  currentCompetitorCompanies: string[];
  matchLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}
