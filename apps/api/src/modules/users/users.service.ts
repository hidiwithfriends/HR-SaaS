import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: UserRole;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 12);

    const user = this.usersRepository.create({
      email: userData.email,
      passwordHash,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      status: UserStatus.ACTIVE,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['stores'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['stores'],
    });
  }

  async validatePassword(
    user: User,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
