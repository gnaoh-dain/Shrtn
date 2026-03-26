import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(50000),

  BASE_URL: z.url(),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_TTL: z.coerce.number().default(3600),
});

export type Env = z.infer<typeof envSchema>;
