import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { Response } from 'express';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './token-payload.interface';
import { RegisterUserDto } from './dtos/register-user.dto';
import { Role } from 'src/common/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    return this.usersService.createUser({
      ...registerUserDto,
      role: Role.USER,
    });
  }

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

    const refreshTokenExpiresAt = new Date();

    refreshTokenExpiresAt.setMilliseconds(
      refreshTokenExpiresAt.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
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

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
    });

    const hashedRefreshToken = await hash(refreshToken, 10);

    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      expires: accessTokenExpiresAt,
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.getOrThrow('NODE_ENV') === 'production',
      expires: refreshTokenExpiresAt,
    });
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({ email });

      if (!user) {
        throw new UnauthorizedException('Credentials are not valid');
      }

      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException('Credentials are not valid');
      }

      return user;
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }

  async verifyUserRefreshToken(refreshToken: string, userId: number) {
    try {
      const user = await this.usersService.getUser({ id: userId });
      if (!user.refreshToken) throw new UnauthorizedException();
      const authenticated = await compare(refreshToken, user?.refreshToken);

      if (!authenticated) throw new UnauthorizedException();
      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
