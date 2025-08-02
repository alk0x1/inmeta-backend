import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import { Request, Response } from 'express';
  import { AppLoggerService } from '../services/logger.service';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: AppLoggerService) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();
      const startTime = Date.now();
  
      const { method, url, headers } = request;
      const userAgent = headers['user-agent'] || '';
  
      return next.handle().pipe(
        tap(() => {
          const responseTime = Date.now() - startTime;
          this.logger.logRequest(
            method,
            url,
            response.statusCode,
            responseTime,
            userAgent,
          );
        }),
      );
    }
  }