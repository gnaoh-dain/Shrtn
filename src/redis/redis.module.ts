import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { env } from '../config/env';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () =>
        new Redis({
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
        }),
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
