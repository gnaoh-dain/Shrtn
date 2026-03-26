import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class LinkService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('LinkService');
  }

  async createShortLink(url: string, customAlias?: string) {
    const { nanoid } = await import('nanoid');
    const shortCode = customAlias || nanoid(6);

    const existingLink = await this.prismaService.link.findUnique({
      where: { short_code: shortCode },
    });

    if (existingLink) {
      this.loggerService.error(`Short code already exists: ${shortCode}`);
      throw new ConflictException('Short code already exists');
    }

    const link = await this.prismaService.link.create({
      data: {
        original_url: url,
        short_code: shortCode,
      },
    });

    await this.redisService.setLink(shortCode, link.original_url);
    this.loggerService.info(`Short code created and set in cache: ${shortCode}`);
    return link;
  }

  async getLinkByShortCode(shortCode: string) {
    this.loggerService.info(`Getting link by short code: ${shortCode}`);

    const cachedLink = await this.redisService.getLink(shortCode);
    if (cachedLink) {
      this.loggerService.info(`Link found in cache: ${cachedLink}`);
      return cachedLink;
    }

    const link = await this.prismaService.link.findUnique({
      where: { short_code: shortCode },
    });
    if (!link || link.is_active === false) {
      this.loggerService.error(`Link not found: ${shortCode}`);
      throw new NotFoundException('Link not found');
    }
    if (link.expires_at && link.expires_at < new Date()) {
      this.loggerService.error(`Link has expired: ${shortCode}`);
      throw new NotFoundException('Link has expired');
    }

    const url = link.original_url;
    await this.redisService.setLink(shortCode, url);
    this.loggerService.info(`Link set in cache: ${shortCode}`);
    return url;
  }
}
