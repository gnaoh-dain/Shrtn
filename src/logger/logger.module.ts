import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggerService } from './logger.service';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, context }) => {
              return `${timestamp} [${context}] ${level}: ${message}`;
            }),
          ),
        }),
      ],
    }),
  ],
  providers: [LoggerService],
  exports: [WinstonModule, LoggerService],
})
export class LoggerModule {}
