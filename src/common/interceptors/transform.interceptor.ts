import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode || 200;

        const customMessage = request?.customMessage || 'Request successful';

        if (data && data.items && data.meta) {
          return {
            statusCode,
            message: customMessage,
            data: data.items,
            meta: data.meta,
          };
        }

        if (data !== undefined && data !== null) {
          return {
            statusCode,
            message: customMessage,
            data,
          };
        }

        return {
          statusCode,
          message: customMessage,
        };
      }),
    );
  }
}
