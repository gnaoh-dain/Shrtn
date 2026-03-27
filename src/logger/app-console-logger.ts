import { ConsoleLogger, type ConsoleLoggerOptions } from '@nestjs/common';

const defaultOptions: ConsoleLoggerOptions = {
  prefix: 'Shrtn',
  colors: true,
  timestamp: true,
  forceConsole: true,
};

export class AppConsoleLogger extends ConsoleLogger {
  constructor(options?: ConsoleLoggerOptions) {
    super({ ...defaultOptions, ...options });
  }

  protected getTimestamp(): string {
    const d = new Date();
    const p = (n: number, w = 2) => String(n).padStart(w, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
  }
}
