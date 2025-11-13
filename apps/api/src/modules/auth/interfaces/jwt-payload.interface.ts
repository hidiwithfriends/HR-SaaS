import { UserRole } from '../../../common/enums';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
}
