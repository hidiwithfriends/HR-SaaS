import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { StoreType, StoreStatus } from '../common/enums';
import { User } from './user.entity';
import { Employee } from './employee.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: StoreType,
  })
  type: StoreType;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ type: 'int', name: 'gps_radius', default: 50 })
  gpsRadius: number;

  @Column({
    type: 'enum',
    enum: StoreStatus,
    default: StoreStatus.ACTIVE,
  })
  status: StoreStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.ownedStores)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Employee, (employee) => employee.store)
  employees: Employee[];
}
