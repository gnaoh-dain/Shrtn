import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TRACK_CLICK_JOB, CLICK_QUEUE } from './queue.constant';

export type ClickJobPayload = {
  linkId: string;
  shortCode: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
};

@Injectable()
export class QueueService implements OnModuleDestroy {
  constructor(@InjectQueue(CLICK_QUEUE) private readonly clickQueue: Queue) {}

  async onModuleDestroy(): Promise<void> {
    await this.clickQueue.close();
  }

  async addClickJob(data: ClickJobPayload) {
    await this.clickQueue.add(TRACK_CLICK_JOB, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
    });
  }
}
