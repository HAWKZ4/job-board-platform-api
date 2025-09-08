import { ExecutionContext, Injectable, mixin } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../dtos/login.dto';

export function LoginRequestTransformGuard() {
  @Injectable()
  class LoginTransformGuard extends AuthGuard('local') {
    override async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      const dto = plainToInstance(LoginDto, request.body);

      request.body = {
        email: String(dto.email),
        password: String(dto.password),
      };

      return super.canActivate(context) as Promise<boolean>;
    }
  }

  return mixin(LoginTransformGuard);
}
