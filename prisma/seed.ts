/**
 * Requires DATABASE_URL. For admin upsert also set:
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 * If either is missing, seed skips admin (no-op). Run: pnpm db:seed
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { UserRole } from '../src/generated/prisma/enums';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  if (!email || !password) {
    console.warn('SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD missing — skip admin seed');
    return;
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for seed');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password_hash: passwordHash,
      role: UserRole.ADMIN,
    },
    update: {
      password_hash: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log('Admin user upserted:', email);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
