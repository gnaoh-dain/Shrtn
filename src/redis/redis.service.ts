// redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { env } from '../config/env';

export type CachedLinkRedirect = { url: string; linkId: string };

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private getTTL(): number {
    return env.REDIS_TTL;
  }

  // =============================
  // Generic methods
  // =============================

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number) {
    const expire = ttl || this.getTTL();
    await this.redis.set(key, value, 'EX', expire);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  // =============================
  // Domain-specific (Link)
  // =============================

  getLinkKey(shortCode: string) {
    return `link:${shortCode}`;
  }

  /**
   * Returns cached url + linkId. Legacy plain-URL values are treated as miss.
   */
  async getLink(shortCode: string): Promise<CachedLinkRedirect | null> {
    const key = this.getLinkKey(shortCode);
    const raw = await this.get(key);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && 'url' in parsed && 'linkId' in parsed) {
        const o = parsed as { url: unknown; linkId: unknown };
        if (typeof o.url === 'string' && typeof o.linkId === 'string') {
          return { url: o.url, linkId: o.linkId };
        }
      }
    } catch {
      /* legacy non-JSON cache */
    }
    return null;
  }

  async setLink(shortCode: string, payload: CachedLinkRedirect) {
    const key = this.getLinkKey(shortCode);
    await this.set(key, JSON.stringify(payload));
  }

  async deleteLink(shortCode: string) {
    const key = this.getLinkKey(shortCode);
    await this.del(key);
  }
}
