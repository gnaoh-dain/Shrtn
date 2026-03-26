import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerService {
  private context?: string;
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  setContext(context: string) {
    this.context = context;
  }

  info(message: string) {
    this.logger.info(message, { context: this.context });
  }

  error(message: string, trace?: string) {
    this.logger.error(message, { trace, context: this.context });
  }

  warn(message: string) {
    this.logger.warn(message, { context: this.context });
  }

  debug(message: string) {
    this.logger.debug(message, { context: this.context });
  }
}
