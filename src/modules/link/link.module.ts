import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [LinkController],
  providers: [LinkService],
})
export class LinkModule {}
