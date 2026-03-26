import { Controller, Post, Get, Param, Body, Redirect } from '@nestjs/common';
import { env } from '../../config/env';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinkService } from './link.service';

@Controller()
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Post('shorten')
  async shortenLink(@Body() dto: CreateLinkDto) {
    const link = await this.linkService.createShortLink(dto.url, dto.customAlias);

    return { short_url: `${env.BASE_URL}/${link.short_code}` };
  }

  @Get(':code')
  @Redirect()
  async redirectToOriginalUrl(@Param('code') code: string) {
    const url = await this.linkService.getLinkByShortCode(code);

    return { url: url, statusCode: 301 };
  }
}
