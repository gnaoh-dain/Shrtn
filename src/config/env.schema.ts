import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(50000),

  BASE_URL: z.url(),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_TTL: z.coerce.number().default(3600),

  THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_GLOBAL_LIMIT: z.coerce.number().int().positive().default(300),
  THROTTLE_REDIRECT_LIMIT: z.coerce.number().int().positive().default(120),
  THROTTLE_SHORTEN_LIMIT: z.coerce.number().int().positive().default(30),

  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(32).default(0),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .describe('Signing secret for access tokens (auth)'),
  JWT_EXPIRES_IN: z
    .string()
    .default('7d')
    .describe('JWT expiry passed to jsonwebtoken, e.g. 15m, 7d'),
});

export type Env = z.infer<typeof envSchema>;
