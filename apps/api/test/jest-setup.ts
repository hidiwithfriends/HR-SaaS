import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.test file for E2E tests
config({ path: resolve(__dirname, '../.env.test') });
