import apiClient from './client';
import {
  ApiResponse,
  SignupOwnerRequest,
  SignupOwnerResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from './types';

/**
 * Sign up a new store owner
 */
export async function signupOwner(
  data: SignupOwnerRequest
): Promise<SignupOwnerResponse> {
  const response = await apiClient.post<ApiResponse<SignupOwnerResponse>>(
    '/auth/signup/owner',
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Signup failed');
  }

  return response.data.data;
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Login failed');
  }

  // Store tokens in localStorage
  if (typeof window !== 'undefined' && response.data.data) {
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }

  return response.data.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
    '/auth/refresh',
    { refreshToken }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Token refresh failed');
  }

  // Update access token in localStorage
  if (typeof window !== 'undefined' && response.data.data.accessToken) {
    localStorage.setItem('accessToken', response.data.data.accessToken);
  }

  return response.data.data;
}

/**
 * Get current user profile
 */
export async function getMe(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('/users/me');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error?.message || 'Failed to get user profile');
  }

  return response.data.data;
}

/**
 * Logout - Clear local tokens
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}
