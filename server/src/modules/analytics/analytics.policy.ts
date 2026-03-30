import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/generated/prisma/enums';
import type { RequestUser } from 'src/common/guards/roles.guard';
import type { GetLinkStatsQueryDto } from './dto/get-link-stats.query.dto';

export const MAX_ANALYTICS_RANGE_MS = 366 * 24 * 60 * 60 * 1000;

export function assertCanViewLink(link: { user_id: string | null }, user: RequestUser): void {
  if (user.role === UserRole.ADMIN) {
    return;
  }
  if (user.role === UserRole.USER) {
    if (link.user_id === null || link.user_id !== user.id) {
      throw new ForbiddenException();
    }
    return;
  }
  throw new ForbiddenException();
}

export function resolveAnalyticsRange(
  linkCreatedAt: Date,
  query: GetLinkStatsQueryDto,
): { from: Date; to: Date; preset: string | null } {
  const now = new Date();
  if (query.from !== undefined || query.to !== undefined) {
    if (query.from === undefined || query.to === undefined) {
      throw new BadRequestException('Both from and to are required when using a custom range');
    }
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid from or to date');
    }
    if (from > to) {
      throw new BadRequestException('from must be before or equal to to');
    }
    if (to.getTime() - from.getTime() > MAX_ANALYTICS_RANGE_MS) {
      throw new BadRequestException('Date range must not exceed 366 days');
    }
    return { from, to, preset: null };
  }

  const preset = query.preset ?? '7d';
  if (preset === 'all') {
    return { from: new Date(linkCreatedAt), to: now, preset: 'all' };
  }
  const days = preset === '7d' ? 7 : 30;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to: now, preset };
}
