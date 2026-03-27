import { env } from './config/env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConsoleLogger } from './logger/app-console-logger';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  if (env.TRUST_PROXY_HOPS > 0) {
    const http = app.getHttpAdapter().getInstance() as { set?: (k: string, v: unknown) => void };
    http.set?.('trust proxy', env.TRUST_PROXY_HOPS);
  }
  app.useLogger(new AppConsoleLogger());

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  await app.listen(env.PORT);
}

void bootstrap();
