import { delay } from './delay';
import type { User, AuthResponse, SignupDto, LoginDto } from './types';
import { ApiError } from './types';

// Mock user data
const mockOwnerUser: User = {
  id: 'user-owner-001',
  email: 'owner@test.com',
  name: '김점주',
  role: 'OWNER',
  phone: '010-1234-5678',
  createdAt: new Date().toISOString(),
};

const mockEmployeeUser: User = {
  id: 'user-employee-001',
  email: 'employee@test.com',
  name: '이직원',
  role: 'EMPLOYEE',
  phone: '010-8765-4321',
  createdAt: new Date().toISOString(),
};

/**
 * Mock signup API
 * Edge cases:
 * - email === 'duplicate@test.com' → EMAIL_ALREADY_EXISTS error
 * - inviteCode === 'EXPIRED' → INVITE_EXPIRED error
 * - email === 'network-fail@test.com' → Network Error
 */
export const mockSignup = async (dto: SignupDto): Promise<AuthResponse> => {
  await delay(1000);

  // Edge case: Network failure
  if (dto.email === 'network-fail@test.com') {
    throw new Error('Network Error: Failed to connect to server');
  }

  // Edge case: Email already exists
  if (dto.email === 'duplicate@test.com') {
    throw new ApiError('EMAIL_ALREADY_EXISTS', '이미 가입된 이메일입니다');
  }

  // Edge case: Expired invite code
  if (dto.inviteCode === 'EXPIRED') {
    throw new ApiError('INVITE_EXPIRED', '초대 링크가 만료되었습니다');
  }

  // Generate mock user based on role
  const mockUser: User = {
    id: `user-${dto.role.toLowerCase()}-${Date.now()}`,
    email: dto.email,
    name: dto.name,
    role: dto.role,
    phone: dto.phone,
    createdAt: new Date().toISOString(),
  };

  return {
    accessToken: `mock-access-token-${Date.now()}`,
    refreshToken: `mock-refresh-token-${Date.now()}`,
    user: mockUser,
  };
};

/**
 * Mock login API
 * Edge cases:
 * - password !== 'password123' → INVALID_CREDENTIALS error
 * - email-based role assignment (owner@test.com → OWNER, employee@test.com → EMPLOYEE)
 */
export const mockLogin = async (dto: LoginDto): Promise<AuthResponse> => {
  await delay(800);

  // Edge case: Invalid credentials
  if (dto.password !== 'password123') {
    throw new ApiError(
      'INVALID_CREDENTIALS',
      '이메일 또는 비밀번호가 잘못되었습니다'
    );
  }

  // Determine user based on email
  const user =
    dto.email === 'owner@test.com' ? mockOwnerUser : mockEmployeeUser;

  return {
    accessToken: `mock-access-token-${Date.now()}`,
    refreshToken: `mock-refresh-token-${Date.now()}`,
    user,
  };
};

/**
 * Mock get current user API
 * Extracts user from token (simplified mock)
 */
export const mockGetMe = async (token: string): Promise<User> => {
  await delay(300);

  if (!token || token === 'invalid') {
    throw new ApiError('UNAUTHORIZED', '인증이 필요합니다');
  }

  // Simple mock: return owner by default
  return mockOwnerUser;
};

/**
 * Mock refresh token API
 */
export const mockRefresh = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  await delay(500);

  if (!refreshToken || refreshToken === 'expired') {
    throw new ApiError('TOKEN_EXPIRED', '세션이 만료되었습니다');
  }

  return {
    accessToken: `mock-access-token-${Date.now()}`,
    refreshToken: `mock-refresh-token-${Date.now()}`,
  };
};
