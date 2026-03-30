import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import type { RequestUser } from 'src/common/guards/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { assertCanViewLink as enforceLinkViewPolicy, resolveAnalyticsRange } from './analytics.policy';
import type { GetLinkStatsQueryDto } from './dto/get-link-stats.query.dto';

const TOP_N = 20;

export type LinkForAuthz = {
  id: string;
  short_code: string;
  original_url: string;
  user_id: string | null;
  created_at: Date;
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async findLinkByIdOrThrow(linkId: string): Promise<LinkForAuthz> {
    const link = await this.prisma.link.findUnique({
      where: { id: linkId },
      select: {
        id: true,
        short_code: true,
        original_url: true,
        user_id: true,
        created_at: true,
      },
    });
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    return link;
  }

  async findLinkByShortCodeOrThrow(shortCode: string): Promise<LinkForAuthz> {
    const link = await this.prisma.link.findUnique({
      where: { short_code: shortCode },
      select: {
        id: true,
        short_code: true,
        original_url: true,
        user_id: true,
        created_at: true,
      },
    });
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    return link;
  }

  async getLinkStats(link: LinkForAuthz, user: RequestUser, query: GetLinkStatsQueryDto) {
    enforceLinkViewPolicy(link, user);
    const range = resolveAnalyticsRange(link.created_at, query);

    const total_clicks = await this.prisma.clickLog.count({
      where: {
        link_id: link.id,
        created_at: { gte: range.from, lte: range.to },
      },
    });

    const [clicks_by_day, top_referrers, by_browser, by_device] = await Promise.all([
      this.queryClicksByDay(link.id, range.from, range.to),
      this.queryTopReferrers(link.id, range.from, range.to),
      this.queryTopBrowsers(link.id, range.from, range.to),
      this.queryTopDevices(link.id, range.from, range.to),
    ]);

    return {
      link: {
        id: link.id,
        short_code: link.short_code,
        original_url: link.original_url,
      },
      range: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        preset: range.preset,
      },
      timezone: 'UTC' as const,
      total_clicks,
      clicks_by_day,
      top_referrers,
      by_browser,
      by_device,
    };
  }

  async getSystemOverview() {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const [total_links, total_click_logs, clicks_last_24h] = await Promise.all([
      this.prisma.link.count(),
      this.prisma.clickLog.count(),
      this.prisma.clickLog.count({
        where: { created_at: { gte: dayAgo } },
      }),
    ]);
    return { total_links, total_click_logs, clicks_last_24h };
  }

  private async queryClicksByDay(linkId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<Array<{ day: Date; cnt: bigint }>>(
      Prisma.sql`
        SELECT (date_trunc('day', cl.created_at AT TIME ZONE 'UTC'))::date AS day,
               COUNT(*)::bigint AS cnt
        FROM click_logs cl
        WHERE cl.link_id = ${linkId}
          AND cl.created_at >= ${from}
          AND cl.created_at <= ${to}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    );
    return rows.map((r) => ({
      date: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
      count: Number(r.cnt),
    }));
  }

  private async queryTopReferrers(linkId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<Array<{ referer: string; cnt: bigint }>>(
      Prisma.sql`
        SELECT
          CASE
            WHEN cl.referer IS NULL OR trim(cl.referer) = '' THEN '(direct)'
            ELSE trim(cl.referer)
          END AS referer,
          COUNT(*)::bigint AS cnt
        FROM click_logs cl
        WHERE cl.link_id = ${linkId}
          AND cl.created_at >= ${from}
          AND cl.created_at <= ${to}
        GROUP BY 1
        ORDER BY cnt DESC
        LIMIT ${TOP_N}
      `,
    );
    return rows.map((r) => ({ referer: r.referer, count: Number(r.cnt) }));
  }

  private async queryTopBrowsers(linkId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<Array<{ browser: string; cnt: bigint }>>(
      Prisma.sql`
        SELECT
          CASE
            WHEN cl.browser IS NULL OR trim(cl.browser) = '' THEN 'unknown'
            ELSE trim(cl.browser)
          END AS browser,
          COUNT(*)::bigint AS cnt
        FROM click_logs cl
        WHERE cl.link_id = ${linkId}
          AND cl.created_at >= ${from}
          AND cl.created_at <= ${to}
        GROUP BY 1
        ORDER BY cnt DESC
        LIMIT ${TOP_N}
      `,
    );
    return rows.map((r) => ({ browser: r.browser, count: Number(r.cnt) }));
  }

  private async queryTopDevices(linkId: string, from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<Array<{ device: string; cnt: bigint }>>(
      Prisma.sql`
        SELECT
          CASE
            WHEN cl.device IS NULL OR trim(cl.device) = '' THEN 'unknown'
            ELSE trim(cl.device)
          END AS device,
          COUNT(*)::bigint AS cnt
        FROM click_logs cl
        WHERE cl.link_id = ${linkId}
          AND cl.created_at >= ${from}
          AND cl.created_at <= ${to}
        GROUP BY 1
        ORDER BY cnt DESC
        LIMIT ${TOP_N}
      `,
    );
    return rows.map((r) => ({ device: r.device, count: Number(r.cnt) }));
  }
}
