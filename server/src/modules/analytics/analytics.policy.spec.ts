import { ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/generated/prisma/enums';
import { assertCanViewLink, resolveAnalyticsRange } from './analytics.policy';
import type { GetLinkStatsQueryDto } from './dto/get-link-stats.query.dto';

describe('analytics.policy', () => {
  describe('assertCanViewLink', () => {
    const guestLink = { user_id: null as string | null };
    const ownedLink = { user_id: 'user-1' };

    it('allows ADMIN for guest link', () => {
      expect(() =>
        assertCanViewLink(guestLink, {
          id: 'admin-1',
          email: 'a@x.com',
          role: UserRole.ADMIN,
        }),
      ).not.toThrow();
    });

    it('allows USER for own link', () => {
      expect(() =>
        assertCanViewLink(ownedLink, {
          id: 'user-1',
          email: 'u@x.com',
          role: UserRole.USER,
        }),
      ).not.toThrow();
    });

    it('forbids USER for guest link', () => {
      expect(() =>
        assertCanViewLink(guestLink, {
          id: 'user-1',
          email: 'u@x.com',
          role: UserRole.USER,
        }),
      ).toThrow(ForbiddenException);
    });

    it('forbids USER for another user link', () => {
      expect(() =>
        assertCanViewLink(
          { user_id: 'other' },
          {
            id: 'user-1',
            email: 'u@x.com',
            role: UserRole.USER,
          },
        ),
      ).toThrow(ForbiddenException);
    });
  });

  describe('resolveAnalyticsRange', () => {
    const created = new Date('2025-01-01T00:00:00.000Z');

    it('defaults to 7d when no params', () => {
      const q: GetLinkStatsQueryDto = {};
      const r = resolveAnalyticsRange(created, q);
      expect(r.preset).toBe('7d');
      expect(r.to.getTime() - r.from.getTime()).toBeGreaterThan(0);
    });

    it('uses all from link created_at', () => {
      const q: GetLinkStatsQueryDto = { preset: 'all' };
      const r = resolveAnalyticsRange(created, q);
      expect(r.preset).toBe('all');
      expect(r.from.toISOString()).toBe(created.toISOString());
    });
  });
});
