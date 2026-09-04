import { ForbiddenException, NotFoundException } from '@nestjs/common';

// Unit test: không cần .env thật, service chỉ đọc env trong createShortLink.
jest.mock('src/config/env', () => ({ env: { GUEST_LINK_TTL_HOURS: 168 } }));

import { UserRole } from 'src/generated/prisma/enums';
import { LinkService } from './link.service';
import { assertCanMutateLink } from './link.policy';
import type { PrismaService } from 'src/prisma/prisma.service';
import type { RedisService } from 'src/redis/redis.service';

const baseLink = {
  id: 'link-1',
  original_url: 'https://example.com',
  short_code: 'abc123',
  user_id: null as string | null,
  is_active: true,
  expires_at: null as Date | null,
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-01T00:00:00.000Z'),
};

function setup(link: typeof baseLink | null = baseLink) {
  const prisma = {
    link: {
      findUnique: jest.fn().mockResolvedValue(link),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(link),
    },
    clickLog: { count: jest.fn().mockResolvedValue(7) },
  };
  const redis = {
    setLink: jest.fn().mockResolvedValue(undefined),
    deleteLink: jest.fn().mockResolvedValue(undefined),
    getLink: jest.fn().mockResolvedValue(null),
  };
  const service = new LinkService(prisma as unknown as PrismaService, redis as unknown as RedisService);
  return { service, prisma, redis };
}

describe('link.policy', () => {
  describe('assertCanMutateLink', () => {
    it('allows anyone on a guest link', () => {
      expect(() => assertCanMutateLink({ user_id: null })).not.toThrow();
    });

    it('allows the owner', () => {
      expect(() =>
        assertCanMutateLink({ user_id: 'user-1' }, { id: 'user-1', email: 'u@x.com', role: UserRole.USER }),
      ).not.toThrow();
    });

    it('allows ADMIN on someone else link', () => {
      expect(() =>
        assertCanMutateLink({ user_id: 'user-1' }, { id: 'admin-1', email: 'a@x.com', role: UserRole.ADMIN }),
      ).not.toThrow();
    });

    it('rejects another USER', () => {
      expect(() =>
        assertCanMutateLink({ user_id: 'user-1' }, { id: 'user-2', email: 'o@x.com', role: UserRole.USER }),
      ).toThrow(ForbiddenException);
    });

    it('rejects an anonymous caller on an owned link', () => {
      expect(() => assertCanMutateLink({ user_id: 'user-1' })).toThrow(ForbiddenException);
    });
  });
});

describe('LinkService', () => {
  it('throws 404 when the link does not exist', async () => {
    const { service } = setup(null);
    await expect(service.getLinkDetail('nope')).rejects.toThrow(NotFoundException);
  });

  it('throws 404 for a deactivated link', async () => {
    const { service } = setup({ ...baseLink, is_active: false });
    await expect(service.getLinkDetail('abc123')).rejects.toThrow(NotFoundException);
  });

  it('throws 404 for an expired link', async () => {
    const { service } = setup({ ...baseLink, expires_at: new Date(Date.now() - 1000) });
    await expect(service.getLinkDetail('abc123')).rejects.toThrow(NotFoundException);
  });

  it('maps a link to the API response shape', async () => {
    const { service } = setup();
    await expect(service.getLinkDetail('abc123')).resolves.toEqual({
      id: 'link-1',
      url: 'https://example.com',
      shortCode: 'abc123',
      createdAt: baseLink.created_at,
      updatedAt: baseLink.updated_at,
    });
  });

  it('refreshes the redis cache with the new url on update', async () => {
    const { service, prisma, redis } = setup();
    const updated = { ...baseLink, original_url: 'https://example.org', updated_at: new Date() };
    prisma.link.update.mockResolvedValue(updated);

    const result = await service.updateLink('abc123', 'https://example.org');

    expect(result.url).toBe('https://example.org');
    expect(redis.setLink).toHaveBeenCalledWith('abc123', {
      url: 'https://example.org',
      linkId: 'link-1',
      expiresAt: null,
    });
  });

  it('does not update an owned link for another user', async () => {
    const { service, prisma, redis } = setup({ ...baseLink, user_id: 'user-1' });

    await expect(
      service.updateLink('abc123', 'https://example.org', {
        id: 'user-2',
        email: 'o@x.com',
        role: UserRole.USER,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.link.update).not.toHaveBeenCalled();
    expect(redis.setLink).not.toHaveBeenCalled();
  });

  it('evicts the redis cache on delete', async () => {
    const { service, prisma, redis } = setup();

    await service.deleteLink('abc123');

    expect(prisma.link.delete).toHaveBeenCalledWith({ where: { short_code: 'abc123' } });
    expect(redis.deleteLink).toHaveBeenCalledWith('abc123');
  });

  it('does not delete an owned link for an anonymous caller', async () => {
    const { service, prisma, redis } = setup({ ...baseLink, user_id: 'user-1' });

    await expect(service.deleteLink('abc123')).rejects.toThrow(ForbiddenException);
    expect(prisma.link.delete).not.toHaveBeenCalled();
    expect(redis.deleteLink).not.toHaveBeenCalled();
  });

  it('returns accessCount from the click logs', async () => {
    const { service, prisma } = setup();

    await expect(service.getLinkStats('abc123')).resolves.toMatchObject({
      shortCode: 'abc123',
      accessCount: 7,
    });
    expect(prisma.clickLog.count).toHaveBeenCalledWith({ where: { link_id: 'link-1' } });
  });
});
