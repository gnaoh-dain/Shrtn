import { Controller, Get, Param, Query, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import type { RequestUser } from 'src/common/guards/roles.guard';
import { env } from 'src/config/env';
import { AnalyticsService } from './analytics.service';
import { GetLinkStatsQueryDto } from './dto/get-link-stats.query.dto';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
@Throttle({
  default: { limit: env.THROTTLE_ANALYTICS_LIMIT, ttl: env.THROTTLE_ANALYTICS_TTL_MS },
})
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('links/:linkId/stats')
  async statsByLinkId(
    @Param('linkId', ParseUUIDPipe) linkId: string,
    @Query() query: GetLinkStatsQueryDto,
    @Req() req: Request & { user: RequestUser },
  ) {
    const link = await this.analyticsService.findLinkByIdOrThrow(linkId);
    return this.analyticsService.getLinkStats(link, req.user, query);
  }

  @Get('by-short/:shortCode/stats')
  async statsByShortCode(
    @Param('shortCode') shortCode: string,
    @Query() query: GetLinkStatsQueryDto,
    @Req() req: Request & { user: RequestUser },
  ) {
    const link = await this.analyticsService.findLinkByShortCodeOrThrow(shortCode);
    return this.analyticsService.getLinkStats(link, req.user, query);
  }
}
