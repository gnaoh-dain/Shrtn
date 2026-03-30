import { Module } from '@nestjs/common';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';
import { AuthModule } from 'src/modules/auth/auth.module';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [PrismaModule, QueueModule, RedisModule, AuthModule],
  controllers: [LinkController],
  providers: [LinkService, OptionalJwtAuthGuard],
})
export class LinkModule {}
