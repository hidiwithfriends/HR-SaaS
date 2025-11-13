import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { EmployeeStatus } from '../common/enums';
import { User } from './user.entity';
import { Store } from './store.entity';

@Entity('employees')
@Index('idx_employee_unique_active', ['userId', 'storeId', 'status'], {
  unique: true,
  where: "status = 'ACTIVE'",
})
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role: string | null;

  @Column({ type: 'int', name: 'hourly_wage', nullable: true })
  hourlyWage: number | null;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Column({ type: 'date', name: 'hired_at' })
  hiredAt: Date;

  @Column({ type: 'date', name: 'quit_at', nullable: true })
  quitAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.employments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Store, (store) => store.employees)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
