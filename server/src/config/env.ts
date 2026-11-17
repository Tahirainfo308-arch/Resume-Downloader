import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

const envFiles = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

for (const envFile of envFiles) {
  dotenv.config({ path: envFile });
}

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/ai_career_studio'),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev_access_secret_change_me'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev_refresh_secret_change_me'),
  JWT_ACCESS_TTL: z.string().min(1).default('15m'),
  JWT_REFRESH_TTL: z.string().min(1).default('7d'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  API_PREFIX: z.string().startsWith('/').default('/api/v1'),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const values = parsed.data;

if (
  values.NODE_ENV === 'production' &&
  (values.JWT_ACCESS_SECRET.startsWith('dev_') || values.JWT_REFRESH_SECRET.startsWith('dev_'))
) {
  console.error('Production requires non-default JWT secrets');
  process.exit(1);
}

export const env = {
  ...values,
  COOKIE_SECURE: values.COOKIE_SECURE === 'true',
  isProduction: values.NODE_ENV === 'production',
  isDevelopment: values.NODE_ENV === 'development',
  isTest: values.NODE_ENV === 'test',
};
