import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(createUserDto: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: UserRole;
  }): Promise<User> {
    // Check for duplicate email
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: '이미 등록된 이메일입니다',
      });
    }

    // Hash password with bcrypt (cost factor 12)
    const passwordHash = await bcrypt.hash(createUserDto.password, SALT_ROUNDS);

    // Create and save user
    const user = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash,
      name: createUserDto.name,
      phone: createUserDto.phone,
      role: createUserDto.role,
    });

    return await this.usersRepository.save(user);
  }

  async update(userId: string, updateDto: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다',
      });
    }

    Object.assign(user, updateDto);
    return await this.usersRepository.save(user);
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    // Compare password hash using bcrypt.compare()
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
