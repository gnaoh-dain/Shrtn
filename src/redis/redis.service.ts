// redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  private getTTL(): number {
    return this.configService.get<number>('redis.ttl') || 3600;
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

  async getLink(shortCode: string): Promise<string | null> {
    const key = this.getLinkKey(shortCode);
    return this.get(key);
  }

  async setLink(shortCode: string, url: string) {
    const key = this.getLinkKey(shortCode);
    await this.set(key, url);
  }

  async deleteLink(shortCode: string) {
    const key = this.getLinkKey(shortCode);
    await this.del(key);
  }
}
