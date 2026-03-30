import { ValidationPipe } from '@nestjs/common';
import { env } from './config/env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConsoleLogger } from './logger/app-console-logger';
import { PrismaService } from './prisma/prisma.service';

function corsOriginOption(raw: string): boolean | string[] {
  const t = raw.trim();
  if (t === '*' || t === '') {
    return true;
  }
  const list = t
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : true;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors({
    origin: corsOriginOption(env.CORS_ORIGIN),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  if (env.TRUST_PROXY_HOPS > 0) {
    const http = app.getHttpAdapter().getInstance() as { set?: (k: string, v: unknown) => void };
    http.set?.('trust proxy', env.TRUST_PROXY_HOPS);
  }
  app.useLogger(new AppConsoleLogger());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  await app.listen(env.PORT);
}

void bootstrap();
