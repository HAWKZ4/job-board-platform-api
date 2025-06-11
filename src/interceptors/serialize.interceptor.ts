import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { Role } from 'src/common/role.enum';

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
    const groups = this.getGroupsFromContext(context);
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
          groups,
        });
      }),
    );
  }

  private getGroupsFromContext(context: ExecutionContext): string[] {
    const request = context.switchToHttp().getRequest();
    return request.user?.role === Role.ADMIN ? ['admin'] : [];
  }
}
