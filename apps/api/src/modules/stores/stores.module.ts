import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { Store } from '../../entities/store.entity';
import { Employee } from '../../entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Employee])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
