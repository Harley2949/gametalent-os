// Auth Types
export type UserRole = 'ADMIN' | 'RECRUITER' | 'INTERVIEWER' | 'HIRING_MANAGER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  title?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const UserRoleLabels: Record<UserRole, string> = {
  ADMIN: '管理员',
  RECRUITER: '招聘官',
  INTERVIEWER: '面试官',
  HIRING_MANAGER: '招聘经理',
  VIEWER: '查看者',
};
