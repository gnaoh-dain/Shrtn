import { Controller, Post, Get, Param, Body, Redirect, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import type { RequestUser } from 'src/common/guards/roles.guard';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-jwt-auth.guard';
import { env } from '../../config/env';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinkService } from './link.service';
import { QueueService } from 'src/queue/queue.service';

@Controller()
export class LinkController {
  constructor(
    private readonly linkService: LinkService,
    private readonly queueService: QueueService,
  ) {}

  @Throttle({
    default: { limit: env.THROTTLE_SHORTEN_LIMIT, ttl: env.THROTTLE_TTL_MS },
  })
  @UseGuards(OptionalJwtAuthGuard)
  @Post('shorten')
  async shortenLink(@Body() dto: CreateLinkDto, @Req() req: Request & { user?: RequestUser }) {
    const link = await this.linkService.createShortLink(dto.url, dto.customAlias, req.user?.id);

    return { short_url: `${env.BASE_URL}/${link.short_code}` };
  }

  @Throttle({
    default: { limit: env.THROTTLE_REDIRECT_LIMIT, ttl: env.THROTTLE_TTL_MS },
  })
  @Get(':code')
  @Redirect()
  async redirectToOriginalUrl(@Param('code') code: string, @Req() request: Request) {
    const { url, linkId } = await this.linkService.getLinkByShortCode(code);
    const h = request.headers;
    const refererRaw = h.referer ?? h.referrer;
    await this.queueService.addClickJob({
      linkId,
      shortCode: code,
      ip: request.ip,
      userAgent: typeof h['user-agent'] === 'string' ? h['user-agent'] : undefined,
      referer: typeof refererRaw === 'string' ? refererRaw : undefined,
    });
    return { url, statusCode: 301 };
  }
}
