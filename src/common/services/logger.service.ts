import { Injectable, Inject, LoggerService as NestLoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AppLoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug?(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose?(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  logRequest(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string) {
    this.logger.info('HTTP Request', {
      context: 'HTTP',
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userAgent,
    });
  }

  logDatabaseQuery(query: string, duration: number, context = 'Database') {
    this.logger.debug('Database Query', {
      context,
      query: query.substring(0, 500),
      duration: `${duration}ms`,
    });
  }

  logBusinessEvent(event: string, details: any, context = 'Business') {
    this.logger.info('Business Event', {
      context,
      event,
      details,
    });
  }

  logAuthEvent(event: string, userId?: number, ip?: string, context = 'Auth') {
    this.logger.info('Authentication Event', {
      context,
      event,
      userId,
      ip,
    });
  }
}