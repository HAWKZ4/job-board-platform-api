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

type MyResponseObj = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new MyLoggerService(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const myResponseObj: MyResponseObj = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.response = exception.getResponse();
    } else if (exception instanceof QueryFailedError) {
      const pgError = exception as any;

      switch (pgError.code) {
        case '23505':
          myResponseObj.statusCode = 409;
          myResponseObj.response = 'Duplicate entry.';
          break;
        case '23502':
          myResponseObj.statusCode = 400;
          myResponseObj.response = 'A required field is missing.';
          break;
        case '23503':
          myResponseObj.statusCode = 409;
          myResponseObj.response = 'Foreign key constraint failed.';
          break;
        default:
          myResponseObj.statusCode = 400;
          myResponseObj.response = 'Database error.';
      }
      // if you use prisma
      // else if (exception instanceof PrismaClientValidationError) {
      //   myResponseObj.statusCode = 422;
      //   myResponseObj.response = exception.message.replaceAll(/\n/g, ' ');
      // }}
    } else {
      // Hide the error details (for security reasons) and return a generic message.
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.response = 'Internal Server Error';
    }

    response.status(myResponseObj.statusCode).json(myResponseObj);

    this.logger.error(myResponseObj.response, AllExceptionsFilter.name);

    super.catch(exception, host);
  }
}
