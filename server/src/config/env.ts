import { loadEnvFiles } from './load-env';
import { envSchema, type Env } from './env.schema';

loadEnvFiles();

export const env: Env = envSchema.parse(process.env);

export type { Env };
