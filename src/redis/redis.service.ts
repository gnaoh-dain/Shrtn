// redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { env } from '../config/env';

export type CachedLinkRedirect = { url: string; linkId: string; expiresAt: string | null };

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private getDefaultTTL(): number {
    return env.REDIS_TTL;
  }

  /**
   * Redis EX for link key: cap by REDIS_TTL and by seconds until link expires (if any).
   */
  private linkKeyExpireSeconds(expiresAtIso: string | null): number {
    const cap = this.getDefaultTTL();
    if (!expiresAtIso) {
      return cap;
    }
    const msLeft = new Date(expiresAtIso).getTime() - Date.now();
    if (msLeft <= 0) {
      return 1;
    }
    const sec = Math.ceil(msLeft / 1000);
    return Math.min(cap, Math.max(1, sec));
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number) {
    const expire = ttl ?? this.getDefaultTTL();
    await this.redis.set(key, value, 'EX', expire);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  getLinkKey(shortCode: string) {
    return `link:${shortCode}`;
  }

  /**
   * Returns cached url + linkId when payload is valid and not expired.
   * Legacy JSON without expiresAt is treated as miss (refetch from DB).
   */
  async getLink(shortCode: string): Promise<CachedLinkRedirect | null> {
    const key = this.getLinkKey(shortCode);
    const raw = await this.get(key);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object' || !('url' in parsed) || !('linkId' in parsed)) {
        return null;
      }
      const o = parsed as { url: unknown; linkId: unknown; expiresAt?: unknown };
      if (typeof o.url !== 'string' || typeof o.linkId !== 'string') {
        return null;
      }
      if (!('expiresAt' in o)) {
        return null;
      }
      if (o.expiresAt !== null && typeof o.expiresAt !== 'string') {
        return null;
      }
      const expiresAt = o.expiresAt;
      if (expiresAt !== null) {
        const expMs = new Date(expiresAt).getTime();
        if (Number.isNaN(expMs) || Date.now() >= expMs) {
          await this.del(key);
          return null;
        }
      }
      return { url: o.url, linkId: o.linkId, expiresAt };
    } catch {
      return null;
    }
  }

  async setLink(shortCode: string, payload: CachedLinkRedirect) {
    const key = this.getLinkKey(shortCode);
    const ex = this.linkKeyExpireSeconds(payload.expiresAt);
    await this.set(key, JSON.stringify(payload), ex);
  }

  async deleteLink(shortCode: string) {
    const key = this.getLinkKey(shortCode);
    await this.del(key);
  }
}
