import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from './types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors and auto-refresh tokens
apiClient.interceptors.response.use(
  (response) => {
    // Return the response data directly (ApiResponse format)
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          try {
            // Try to refresh the access token
            const response = await axios.post<ApiResponse>(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/refresh`,
              { refreshToken }
            );

            if (response.data.success && response.data.data?.accessToken) {
              const newAccessToken = response.data.data.accessToken;
              localStorage.setItem('accessToken', newAccessToken);

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            // Redirect to login page
            if (window.location.pathname !== '/auth/login') {
              window.location.href = '/auth/login';
            }

            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token - redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');

          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// Named export for consistency
export { apiClient };

// Default export for convenience
export default apiClient;
