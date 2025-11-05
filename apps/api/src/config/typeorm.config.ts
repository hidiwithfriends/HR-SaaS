import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../../.env.development') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'hr_saas_dev',
  entities: [join(__dirname, '../entities/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/**/*{.ts,.js}')],
  synchronize: false, // NEVER use true in production
  logging: process.env.NODE_ENV === 'development',
});
