// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export enum UserRole {
  OWNER = 'OWNER',
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN',
}

export interface SignupOwnerRequest {
  email: string;
  password: string;
  name: string;
  storeName: string;
}

export interface SignupOwnerResponse {
  userId: string;
  email: string;
  role: UserRole;
  storeId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
