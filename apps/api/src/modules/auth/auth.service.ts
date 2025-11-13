import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Store } from '../../entities/store.entity';
import { UsersService } from '../users/users.service';
import { SignupOwnerDto } from './dto/signup-owner.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole, StoreType } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async signupOwner(dto: SignupOwnerDto): Promise<{
    userId: string;
    email: string;
    role: UserRole;
    storeId: string;
  }> {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: '이미 등록된 이메일입니다',
      });
    }

    // Transaction: Create User + Store atomically
    return await this.dataSource.transaction(async (manager) => {
      // 1. Create user with role=OWNER
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: UserRole.OWNER,
      });
      await manager.save(user);

      // 2. Create store owned by user
      const store = manager.create(Store, {
        ownerId: user.id,
        name: dto.storeName,
        type: StoreType.CAFE, // Default type
      });
      await manager.save(store);

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        storeId: store.id,
      };
    });
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Validate credentials
    const user = await this.usersService.validateCredentials(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 잘못되었습니다',
      });
    }

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as any,
    });

    return {
      accessToken,
      refreshToken,
      user: new UserResponseDto(user),
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Generate new access token
      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      const accessToken = this.jwtService.sign(newPayload);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: '유효하지 않은 토큰입니다',
      });
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }
    return user;
  }
}
