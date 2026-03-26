import 'dotenv/config';
import { envSchema, type Env } from './env.schema';

export const env: Env = envSchema.parse(process.env);

export type { Env };
