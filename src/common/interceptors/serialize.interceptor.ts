import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

interface ClassConstructor {
  new (...args: any[]): {};
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly dto: any) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return {
            ...response,
            data: plainToInstance(this.dto, response.data, {
              excludeExtraneousValues: true,
            }),
          };
        }

        return plainToInstance(this.dto, response, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
