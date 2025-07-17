import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/set-response-message.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, any>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // read custom message from metadata using Reflector
    const customMessage = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((response) => {
        const message = customMessage || this.getMessage(context);
        if (response?.data && response?.meta) {
          return {
            success: true,
            message,
            data: response.data,
            meta: response.meta,
          };
        }

        return {
          success: true,
          message,
          data: response,
        };
      }),
    );
  }

  private getMessage(context: ExecutionContext): string {
    const handler = context.getHandler();
    const className = context.getClass().name;
    const handlerName = handler.name;

    // You can customize this - even use decorators to set custom messages
    if (handlerName.startsWith('get')) return 'Data fetched successfully';

    if (handlerName.startsWith('create') || handlerName.startsWith('register'))
      return 'Resource created successfully';

    if (handlerName.startsWith('update'))
      return 'Resource updated successfully';

    if (handlerName.startsWith('delete'))
      return 'Resource deleted successfully';

    return 'Request successful';
  }
}
