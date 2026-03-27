import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CLICK_QUEUE, TRACK_CLICK_JOB } from './queue.constant';
import type { ClickJobPayload } from './queue.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor(CLICK_QUEUE)
@Injectable()
export class ClickProcessor extends WorkerHost {
  private readonly logger = new Logger(ClickProcessor.name);

  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== TRACK_CLICK_JOB) {
      throw new Error(`Unexpected job name: ${job.name}`);
    }
    const { linkId, shortCode, ip, userAgent, referer } = job.data as ClickJobPayload;
    this.logger.log(`track-click ${JSON.stringify({ linkId, shortCode, ip, userAgent, referer })}`);
    await this.prismaService.clickLog.create({
      data: {
        link_id: linkId,
        ip_address: ip ?? '',
        user_agent: userAgent ?? '',
        referer: referer ?? null,
      },
    });
  }
}
