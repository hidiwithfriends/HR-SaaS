import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store, StoreType, StoreStatus } from '../../entities/store.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async create(storeData: {
    ownerId: string;
    name: string;
    type: StoreType;
    address?: string;
  }): Promise<Store> {
    const store = this.storesRepository.create({
      ownerId: storeData.ownerId,
      name: storeData.name,
      type: storeData.type,
      address: storeData.address,
      status: StoreStatus.ACTIVE,
    });

    return this.storesRepository.save(store);
  }

  async findByOwnerId(ownerId: string): Promise<Store[]> {
    return this.storesRepository.find({
      where: { ownerId },
    });
  }

  async findById(id: string): Promise<Store | null> {
    return this.storesRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }
}
