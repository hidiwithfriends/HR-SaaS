import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../entities/store.entity';
import { Employee } from '../../entities/employee.entity';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreStatus } from '../../common/enums';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  /**
   * Get all stores for a user (as owner or employee)
   */
  async findStoresByUserId(userId: string): Promise<Store[]> {
    // Find stores where user is the owner
    const ownedStores = await this.storesRepository.find({
      where: { ownerId: userId, status: StoreStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    // Find stores where user is an employee
    const employments = await this.employeesRepository.find({
      where: { userId, status: 'ACTIVE' as any },
      relations: ['store'],
    });

    const employedStores = employments
      .map(emp => emp.store)
      .filter(store => store.status === StoreStatus.ACTIVE);

    // Combine and deduplicate
    const allStores = [...ownedStores, ...employedStores];
    const uniqueStores = Array.from(
      new Map(allStores.map(s => [s.id, s])).values()
    );

    return uniqueStores;
  }

  /**
   * Get store by ID
   */
  async findOne(storeId: string, userId: string): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: { id: storeId },
      relations: ['owner'],
    });

    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        message: '매장을 찾을 수 없습니다',
      });
    }

    // Check if user has access (owner or employee)
    await this.checkStoreAccess(storeId, userId);

    return store;
  }

  /**
   * Update store information (OWNER only)
   */
  async update(storeId: string, userId: string, updateDto: UpdateStoreDto): Promise<Store> {
    const store = await this.storesRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        message: '매장을 찾을 수 없습니다',
      });
    }

    // Only owner can update store info
    if (store.ownerId !== userId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: '매장 정보를 수정할 권한이 없습니다',
      });
    }

    // Update fields
    Object.assign(store, updateDto);

    return await this.storesRepository.save(store);
  }

  /**
   * Get employees for a store
   */
  async findEmployees(storeId: string, userId: string) {
    // Check access
    await this.checkStoreAccess(storeId, userId);

    const employees = await this.employeesRepository.find({
      where: { storeId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return employees.map(emp => ({
      id: emp.id,
      userId: emp.userId,
      role: emp.role,
      hourlyWage: emp.hourlyWage,
      status: emp.status,
      hiredAt: emp.hiredAt,
      quitAt: emp.quitAt,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
      user: {
        id: emp.user.id,
        email: emp.user.email,
        name: emp.user.name,
        role: emp.user.role,
      },
    }));
  }

  /**
   * Check if user has access to store (owner or employee)
   */
  private async checkStoreAccess(storeId: string, userId: string): Promise<void> {
    const store = await this.storesRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        message: '매장을 찾을 수 없습니다',
      });
    }

    // Check if user is owner
    if (store.ownerId === userId) {
      return;
    }

    // Check if user is employee
    const employment = await this.employeesRepository.findOne({
      where: { storeId, userId },
    });

    if (!employment) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: '해당 매장에 접근할 권한이 없습니다',
      });
    }
  }
}
