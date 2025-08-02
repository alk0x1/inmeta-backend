import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch(BadRequestException)
  export class ValidationExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ValidationExceptionFilter.name);
  
    catch(exception: BadRequestException, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
  
      let validationErrors = [];
      let message = 'Validation failed';
  
      if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
        validationErrors = exceptionResponse.message;
        message = 'Input validation failed';
      } else if (typeof exceptionResponse.message === 'string') {
        message = exceptionResponse.message;
      }
  
      const errorResponse = {
        success: false,
        statusCode: status,
        error: 'Validation Error',
        message,
        validationErrors,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      };
  
      this.logger.warn(
        `Validation Error: ${request.method} ${request.url} - ${JSON.stringify(validationErrors)}`,
      );
  
      response.status(status).json(errorResponse);
    }
  }