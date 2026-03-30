import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config as dotenvConfig } from 'dotenv';

function findServerRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    if (existsSync(resolve(dir, 'prisma', 'schema.prisma'))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  throw new Error(
    `Không tìm thấy server root (prisma/schema.prisma) từ ${startDir}. Kiểm tra cấu trúc build Nest.`,
  );
}

export function loadEnvFiles(): void {
  const serverRoot = findServerRoot(__dirname);
  const monorepoRoot = dirname(serverRoot);
  const paths = [resolve(monorepoRoot, '.env'), resolve(serverRoot, '.env')];

  for (const path of paths) {
    if (existsSync(path)) {
      dotenvConfig({ path, override: true });
    }
  }
}
