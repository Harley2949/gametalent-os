export interface Candidate {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'HIRED' | 'ARCHIVED';
  stage?: 'INITIAL_SCREENING' | 'INTERVIEW' | 'OFFER' | 'ONBOARDING' | 'HIRED' | 'REJECTED';
  source: 'LINKEDIN' | 'REFERRAL' | 'DIRECT' | 'AGENCY' | 'OTHER';
  sourceUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  location?: string;
  currentCompany?: string;
  currentTitle?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  yearsOfExperience?: number;
  educationLevel?: 'HIGH_SCHOOL' | 'BACHELOR' | 'MASTER' | 'PHD' | 'OTHER';
  school?: string;
  major?: string;
  graduationYear?: number;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateListResponse {
  data: Candidate[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateCandidateDto {
  email: string;
  name: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  location?: string;
  currentCompany?: string;
  currentTitle?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  yearsOfExperience?: number;
  notes?: string;
  tags?: string[];
  source?: 'LINKEDIN' | 'REFERRAL' | 'DIRECT' | 'AGENCY' | 'OTHER';
}

export interface UpdateCandidateDto {
  name?: string;
  phoneNumber?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  location?: string;
  currentCompany?: string;
  currentTitle?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  yearsOfExperience?: number;
  notes?: string;
  tags?: string[];
  status?: 'ACTIVE' | 'INACTIVE' | 'HIRED' | 'ARCHIVED';
}

export interface CandidateQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  tags?: string[];
  company?: string;
}
