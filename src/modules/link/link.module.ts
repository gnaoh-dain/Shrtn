import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [PrismaModule, QueueModule, RedisModule],
  controllers: [LinkController],
  providers: [LinkService],
})
export class LinkModule {}
