import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let redis: { get: jest.Mock; del: jest.Mock; set: jest.Mock };

  beforeEach(() => {
    redis = {
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
      set: jest.fn().mockResolvedValue('OK'),
    };
    service = new RedisService(redis as never);
  });

  describe('getLink', () => {
    it('returns null for legacy JSON without expiresAt (treat as miss)', async () => {
      redis.get.mockResolvedValue(JSON.stringify({ url: 'https://example.com', linkId: 'u1' }));
      await expect(service.getLink('abc')).resolves.toBeNull();
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('returns null and deletes key when expiresAt is in the past', async () => {
      const past = new Date(Date.now() - 3_600_000).toISOString();
      redis.get.mockResolvedValue(JSON.stringify({ url: 'https://example.com', linkId: 'u1', expiresAt: past }));
      await expect(service.getLink('xyz')).resolves.toBeNull();
      expect(redis.del).toHaveBeenCalledWith('link:xyz');
    });

    it('returns payload when expiresAt is null', async () => {
      redis.get.mockResolvedValue(JSON.stringify({ url: 'https://example.com', linkId: 'u1', expiresAt: null }));
      await expect(service.getLink('ok')).resolves.toEqual({
        url: 'https://example.com',
        linkId: 'u1',
        expiresAt: null,
      });
    });

    it('returns payload when expiresAt is in the future', async () => {
      const future = new Date(Date.now() + 3_600_000).toISOString();
      redis.get.mockResolvedValue(JSON.stringify({ url: 'https://example.com', linkId: 'u1', expiresAt: future }));
      await expect(service.getLink('f')).resolves.toEqual({
        url: 'https://example.com',
        linkId: 'u1',
        expiresAt: future,
      });
    });
  });
});
