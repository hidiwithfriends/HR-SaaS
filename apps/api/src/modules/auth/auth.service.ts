import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
import { SignupOwnerDto } from './dto/signup-owner.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../../entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private storesService: StoresService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async signupOwner(signupDto: SignupOwnerDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Email already exists',
        },
      });
    }

    // Create user and store in transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user
      const user = await this.usersService.create({
        email: signupDto.email,
        password: signupDto.password,
        name: signupDto.name,
        phone: signupDto.phone,
        role: UserRole.OWNER,
      });

      // Create store
      const store = await this.storesService.create({
        ownerId: user.id,
        name: signupDto.storeName,
        type: signupDto.storeType,
      });

      await queryRunner.commitTransaction();

      return {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
          storeId: store.id,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Validate password
    const isPasswordValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Get user's store (for OWNER role)
    let storeId: string | undefined;
    if (user.role === UserRole.OWNER && user.stores && user.stores.length > 0) {
      storeId = user.stores[0].id;
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role, storeId);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException();
      }

      // Get user's store (for OWNER role)
      let storeId: string | undefined;
      if (
        user.role === UserRole.OWNER &&
        user.stores &&
        user.stores.length > 0
      ) {
        storeId = user.stores[0].id;
      }

      const accessToken = this.generateAccessToken(
        user.id,
        user.role,
        storeId,
      );

      return {
        success: true,
        data: {
          accessToken,
        },
      };
    } catch (error) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid refresh token',
        },
      });
    }
  }

  private generateAccessToken(
    userId: string,
    role: UserRole,
    storeId?: string,
  ): string {
    const payload = { userId, role, storeId };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '24h',
    });
  }

  private generateRefreshToken(userId: string): string {
    const payload = { userId };
    return this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '30d',
    });
  }
}
