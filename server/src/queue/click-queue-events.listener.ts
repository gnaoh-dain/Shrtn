import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { CLICK_QUEUE } from './queue.constant';

@Injectable()
export class ClickQueueEventsListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ClickQueueEventsListener.name);
  private readonly connection: IORedis;
  private readonly queueEvents: QueueEvents;

  constructor() {
    this.connection = new IORedis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      maxRetriesPerRequest: null,
    });
    this.queueEvents = new QueueEvents(CLICK_QUEUE, { connection: this.connection });
  }

  async onModuleInit(): Promise<void> {
    // this.queueEvents.on('completed', (args) => {
    //   const rv =
    //     args.returnvalue === undefined || args.returnvalue === null
    //       ? ''
    //       : ` returnvalue=${
    //           typeof args.returnvalue === 'string' ? args.returnvalue : JSON.stringify(args.returnvalue)
    //         }`;
    //   this.logger.log(`Job ${args.jobId} completed${rv}`);
    // });

    this.queueEvents.on('failed', (args) => {
      this.logger.error(`Job ${args.jobId} failed`, args.failedReason);
    });

    this.queueEvents.on('error', (err) => {
      this.logger.error('QueueEvents Redis error', err?.stack ?? String(err));
    });

    await this.queueEvents.waitUntilReady();
  }

  async onModuleDestroy(): Promise<void> {
    await this.queueEvents.close();
    await this.connection.quit();
  }
}
