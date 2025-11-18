import { ExecutionContext, Injectable, mixin } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { LoginUserRequestDto } from '../dtos/login-user-request.dto';

export function LoginRequestTransformGuard() {
  @Injectable()
  class LoginTransformGuard extends AuthGuard('local') {
    override async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      const dto = plainToInstance(LoginUserRequestDto, request.body);

      request.body = {
        email: String(dto.email),
        password: String(dto.password),
      };

      return super.canActivate(context) as Promise<boolean>;
    }
  }

  return mixin(LoginTransformGuard);
}
