import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development';
dotenv.config({ path: envFile });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'bestpractice_hr_dev',
  entities: ['src/entities/**/*.entity.ts'],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false,
  logging: true,
});
