export type UserRole = 'OWNER' | 'EMPLOYEE' | 'MANAGER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  inviteCode?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
