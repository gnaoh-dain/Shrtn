import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

export type ResolvedLinkRedirect = { url: string; linkId: string };

@Injectable()
export class LinkService {
  private readonly logger = new Logger(LinkService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async createShortLink(url: string, customAlias?: string) {
    const { nanoid } = await import('nanoid');
    const shortCode = customAlias || nanoid(6);

    const existingLink = await this.prismaService.link.findUnique({
      where: { short_code: shortCode },
    });

    if (existingLink) {
      this.logger.error(`Short code already exists: ${shortCode}`);
      throw new ConflictException('Short code already exists');
    }

    const link = await this.prismaService.link.create({
      data: {
        original_url: url,
        short_code: shortCode,
      },
    });

    await this.redisService.setLink(shortCode, { url: link.original_url, linkId: link.id });
    this.logger.log(`Short code created and set in cache: ${shortCode}`);
    return link;
  }

  async getLinkByShortCode(shortCode: string): Promise<ResolvedLinkRedirect> {
    this.logger.log(`Getting link by short code: ${shortCode}`);

    const cached = await this.redisService.getLink(shortCode);
    if (cached) {
      this.logger.log(`Link found in cache: ${cached.url}`);
      return cached;
    }

    const link = await this.prismaService.link.findUnique({
      where: { short_code: shortCode },
    });
    if (!link || link.is_active === false) {
      this.logger.error(`Link not found: ${shortCode}`);
      throw new NotFoundException('Link not found');
    }
    if (link.expires_at && link.expires_at < new Date()) {
      this.logger.error(`Link has expired: ${shortCode}`);
      throw new NotFoundException('Link has expired');
    }

    const resolved: ResolvedLinkRedirect = { url: link.original_url, linkId: link.id };
    await this.redisService.setLink(shortCode, resolved);
    this.logger.log(`Link set in cache: ${shortCode}`);
    return resolved;
  }
}
