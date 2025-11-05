import apiClient from './api-client';
import {
  SignupOwnerData,
  LoginData,
  AuthResponse,
  SignupResponse,
} from '@/types/auth';

export const authApi = {
  signupOwner: async (data: SignupOwnerData): Promise<SignupResponse> => {
    const response = await apiClient.post('/auth/signup/owner', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};
