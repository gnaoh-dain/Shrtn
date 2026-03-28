import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { env } from 'src/config/env';
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

  async createShortLink(url: string, customAlias?: string, authenticatedUserId?: string) {
    const { customAlphabet } = await import('nanoid');
    const shortCode =
      customAlias || customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8)();

    const existingLink = await this.prismaService.link.findUnique({
      where: { short_code: shortCode },
    });

    if (existingLink) {
      this.logger.error(`Short code already exists: ${shortCode}`);
      throw new ConflictException('Short code already exists');
    }

    const guestTtlMs = env.GUEST_LINK_TTL_HOURS * 60 * 60 * 1000;
    // const guestTtlMs = 30000; // 30 seconds
    const link = authenticatedUserId
      ? await this.prismaService.link.create({
          data: {
            original_url: url,
            short_code: shortCode,
            user_id: authenticatedUserId,
            expires_at: null,
          },
        })
      : await this.prismaService.link.create({
          data: {
            original_url: url,
            short_code: shortCode,
            expires_at: new Date(Date.now() + guestTtlMs),
          },
        });

    const expiresAtIso = link.expires_at ? link.expires_at.toISOString() : null;
    await this.redisService.setLink(shortCode, {
      url: link.original_url,
      linkId: link.id,
      expiresAt: expiresAtIso,
    });
    this.logger.log(`Short code created and set in cache: ${shortCode}`);
    return link;
  }

  async getLinkByShortCode(shortCode: string): Promise<ResolvedLinkRedirect> {
    this.logger.log(`Getting link by short code: ${shortCode}`);

    const cached = await this.redisService.getLink(shortCode);
    if (cached) {
      this.logger.log(`Link found in cache: ${cached.url}`);
      return { url: cached.url, linkId: cached.linkId };
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

    const expiresAtIso = link.expires_at ? link.expires_at.toISOString() : null;
    await this.redisService.setLink(shortCode, {
      url: link.original_url,
      linkId: link.id,
      expiresAt: expiresAtIso,
    });
    this.logger.log(`Link set in cache: ${shortCode}`);
    return { url: link.original_url, linkId: link.id };
  }
}
