export enum UserRole {
  OWNER = 'OWNER',
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN',
}

export enum StoreType {
  CAFE = 'CAFE',
  RESTAURANT = 'RESTAURANT',
  RETAIL = 'RETAIL',
  SALON = 'SALON',
  OTHER = 'OTHER',
}

export interface SignupOwnerData {
  email: string;
  password: string;
  name: string;
  phone: string;
  storeName: string;
  storeType: StoreType;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface SignupResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
    role: UserRole;
    storeId: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}
