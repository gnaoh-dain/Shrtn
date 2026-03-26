import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LinkModule } from './modules/link/link.module';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './logger/logger.module';

import redisConfig from './config/redis.config';
import databaseConfig from './config/database.config';
import appConfig from './config/app.configs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, redisConfig],
    }),
    LoggerModule,
    RedisModule,
    PrismaModule,
    LinkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
