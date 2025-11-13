import { Exclude } from 'class-transformer';
import { UserRole, UserStatus } from '../../../common/enums';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  passwordHash: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}
