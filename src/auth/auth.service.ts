import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { Response } from 'express';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    // To make cookie expires with accessToken at the same time
    const accessTokenExpiresAt = new Date();

    accessTokenExpiresAt.setMilliseconds(
      accessTokenExpiresAt.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      expires: accessTokenExpiresAt,
    });
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({ email });

      if (!user) {
        throw new UnauthorizedException('Credentials are not valid 1');
      }

      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException('Credentials are not valid 2');
      }

      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid 3');
    }
  }
}
