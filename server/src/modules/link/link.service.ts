import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { RequestUser } from 'src/common/guards/roles.guard';
import { env } from 'src/config/env';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { assertCanMutateLink } from './link.policy';

export type ResolvedLinkRedirect = { url: string; linkId: string };

export type LinkResponse = {
  id: string;
  url: string;
  shortCode: string;
  createdAt: Date;
  updatedAt: Date;
};

type LinkRecord = {
  id: string;
  original_url: string;
  short_code: string;
  user_id: string | null;
  is_active: boolean;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class LinkService {
  private readonly logger = new Logger(LinkService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  toLinkResponse(link: LinkRecord): LinkResponse {
    return {
      id: link.id,
      url: link.original_url,
      shortCode: link.short_code,
      createdAt: link.created_at,
      updatedAt: link.updated_at,
    };
  }

  /** Loads a link that is still resolvable, or throws 404 (missing / disabled / expired). */
  private async findActiveOrThrow(shortCode: string): Promise<LinkRecord> {
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
    return link;
  }

  private async cacheLink(link: LinkRecord) {
    await this.redisService.setLink(link.short_code, {
      url: link.original_url,
      linkId: link.id,
      expiresAt: link.expires_at ? link.expires_at.toISOString() : null,
    });
  }

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

    await this.cacheLink(link);
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

    const link = await this.findActiveOrThrow(shortCode);
    await this.cacheLink(link);
    this.logger.log(`Link set in cache: ${shortCode}`);
    return { url: link.original_url, linkId: link.id };
  }

  async getLinkDetail(shortCode: string): Promise<LinkResponse> {
    return this.toLinkResponse(await this.findActiveOrThrow(shortCode));
  }

  async updateLink(shortCode: string, url: string, user?: RequestUser): Promise<LinkResponse> {
    const existing = await this.findActiveOrThrow(shortCode);
    assertCanMutateLink(existing, user);

    const link = await this.prismaService.link.update({
      where: { short_code: shortCode },
      data: { original_url: url },
    });
    await this.cacheLink(link);
    this.logger.log(`Link updated and cache refreshed: ${shortCode}`);
    return this.toLinkResponse(link);
  }

  async deleteLink(shortCode: string, user?: RequestUser): Promise<void> {
    const existing = await this.findActiveOrThrow(shortCode);
    assertCanMutateLink(existing, user);

    await this.prismaService.link.delete({ where: { short_code: shortCode } });
    await this.redisService.deleteLink(shortCode);
    this.logger.log(`Link deleted and removed from cache: ${shortCode}`);
  }

  async getLinkStats(shortCode: string): Promise<LinkResponse & { accessCount: number }> {
    const link = await this.findActiveOrThrow(shortCode);
    const accessCount = await this.prismaService.clickLog.count({
      where: { link_id: link.id },
    });
    return { ...this.toLinkResponse(link), accessCount };
  }
}
