import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { env } from '../config/env';
import { CLICK_QUEUE } from './queue.constant';
import { ClickProcessor } from './click.processor';
import { ClickQueueEventsListener } from './click-queue-events.listener';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        maxRetriesPerRequest: null,
      },
    }),
    BullModule.registerQueue({ name: CLICK_QUEUE }),
  ],
  providers: [QueueService, ClickQueueEventsListener, ClickProcessor],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
