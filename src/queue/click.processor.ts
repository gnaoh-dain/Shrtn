import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { UAParser } from 'ua-parser-js';
import { CLICK_QUEUE, TRACK_CLICK_JOB } from './queue.constant';
import type { ClickJobPayload } from './queue.service';
import { PrismaService } from 'src/prisma/prisma.service';

function parseClientHints(userAgent: string | undefined): { device: string | null; browser: string | null } {
  const ua = userAgent?.trim() ?? '';
  if (!ua) {
    return { device: null, browser: null };
  }
  const p = new UAParser(ua);
  const browser = p.getBrowser().name ?? null;
  const deviceType = p.getDevice().type;
  const osName = p.getOS().name;
  const device = deviceType ?? osName ?? null;
  return { device, browser };
}

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
    const { device, browser } = parseClientHints(userAgent);
    this.logger.log(`track-click ${JSON.stringify({ linkId, shortCode, ip, userAgent, referer })}`);
    await this.prismaService.clickLog.create({
      data: {
        short_code: shortCode,
        link_id: linkId,
        ip_address: ip ?? '',
        user_agent: userAgent ?? '',
        referer: referer ?? null,
        device,
        browser,
      },
    });
  }
}
