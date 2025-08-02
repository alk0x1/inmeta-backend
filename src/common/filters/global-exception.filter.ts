import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
  
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status: number;
      let message: string | object;
      let error: string;
      let details: any = {};
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        
        if (typeof exceptionResponse === 'object') {
          message = (exceptionResponse as any).message || exception.message;
          error = (exceptionResponse as any).error || 'Http Exception';
          details = exceptionResponse;
        } else {
          message = exceptionResponse;
          error = 'Http Exception';
        }
      } else if (exception instanceof PrismaClientKnownRequestError) {
        const prismaError = this.handlePrismaError(exception);
        status = prismaError.status;
        message = prismaError.message;
        error = prismaError.error;
        details = prismaError.details;
      } else if (exception instanceof PrismaClientValidationError) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database validation error';
        error = 'Validation Error';
        details = { prismaError: exception.message };
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
        error = 'Internal Server Error';
        
        if (exception instanceof Error) {
          details = {
            name: exception.name,
            stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
          };
        }
      }
  
      const errorResponse = {
        success: false,
        statusCode: status,
        error,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      };
  
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : 'No stack trace',
      );
  
      response.status(status).json(errorResponse);
    }
  
    private handlePrismaError(exception: PrismaClientKnownRequestError): {
      status: number;
      message: string;
      error: string;
      details: any;
    } {
      switch (exception.code) {
        case 'P2002':
          return {
            status: HttpStatus.CONFLICT,
            message: `Duplicate entry for ${exception.meta?.target || 'unique field'}`,
            error: 'Duplicate Entry',
            details: {
              fields: exception.meta?.target,
              prismaCode: exception.code,
            },
          };
  
        case 'P2025':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Record not found or does not exist',
            error: 'Record Not Found',
            details: {
              prismaCode: exception.code,
              cause: exception.meta?.cause,
            },
          };
  
        case 'P2003':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Foreign key constraint violation',
            error: 'Foreign Key Constraint',
            details: {
              field: exception.meta?.field_name,
              prismaCode: exception.code,
            },
          };
  
        case 'P2014':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid ID provided in the query',
            error: 'Invalid ID',
            details: {
              prismaCode: exception.code,
            },
          };
  
        case 'P2021':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Table does not exist in the database',
            error: 'Table Not Found',
            details: {
              table: exception.meta?.table,
              prismaCode: exception.code,
            },
          };
  
        case 'P2022':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'Column does not exist in the database',
            error: 'Column Not Found',
            details: {
              column: exception.meta?.column,
              prismaCode: exception.code,
            },
          };
  
        default:
          return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Database error occurred',
            error: 'Database Error',
            details: {
              prismaCode: exception.code,
              prismaMessage: exception.message,
            },
          };
      }
    }
  }