import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { Request } from 'express';
  
  export interface Response<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
    path: string;
    method: string;
  }
  
  @Injectable()
  export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
      const request = context.switchToHttp().getRequest<Request>();
      
      return next.handle().pipe(
        map((data) => {
          if (data && typeof data === 'object' && data.success !== undefined) {
            return data;
          }
  
          return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          };
        }),
      );
    }
  }