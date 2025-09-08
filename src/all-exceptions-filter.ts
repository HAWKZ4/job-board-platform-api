import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { MyLoggerService } from './my-logger/my-logger.service';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new MyLoggerService(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const timestamp = new Date().toISOString();
    const path = request.url;
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || JSON.stringify(res);
      }
    } else if (exception instanceof QueryFailedError) {
      const pgError = exception as any;

      switch (pgError.code) {
        case '23505':
          statusCode = 409;
          message = 'Duplicate entry.';
          break;
        case '23502':
          statusCode = 400;
          message = 'A required field is missing.';
          break;
        case '23503':
          statusCode = 409;
          message = 'Foreign key constraint failed.';
          break;
        default:
          statusCode = 400;
          message = 'Database error.';
      }
    }

    const formattedError = {
      statusCode,
      message,
      path,
      timestamp,
    };

    response.status(statusCode).json(formattedError);

    this.logger.error(message, AllExceptionsFilter.name);

    super.catch(exception, host);
  }
}
