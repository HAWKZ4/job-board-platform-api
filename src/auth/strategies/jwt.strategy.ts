import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { UsersService } from 'src/users/users.service';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Authentication,
      ]),
      // This tells Passport NOT to accept expired tokens.
      // If the token is expired, Passport will throw an unauthorized error (usually 401).
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: TokenPayload): Promise<SafeUser> {
    const user = await this.usersService.findOneById(+payload.userId);
    if (!user) throw new NotFoundException('User not found');
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
