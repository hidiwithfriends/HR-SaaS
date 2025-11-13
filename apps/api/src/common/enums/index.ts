/**
 * User-related enums
 */

export enum UserRole {
  OWNER = 'OWNER',
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Store-related enums
 */

export enum StoreType {
  CAFE = 'CAFE',
  RESTAURANT = 'RESTAURANT',
  RETAIL = 'RETAIL',
  SALON = 'SALON',
  OTHER = 'OTHER',
}

export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/**
 * Employee-related enums
 */

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  QUIT = 'QUIT',
}
