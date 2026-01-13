import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { TokenPayload } from './interfaces/token-payload.interface';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import * as ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new MyLoggerService(AuthService.name);

  async register(dto: RegisterUserDto, response: Response) {
    const newUser = await this.usersService.create({
      ...dto,
      role: UserRole.USER,
    });
    const { accessToken, refreshToken } = await this.generateTokens(newUser);
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(newUser.id, hashedRefreshToken);
    await this.setCookies(response, accessToken, refreshToken);

    this.logger.log(
      `User ${newUser.id} logged in successfully`,
      AuthService.name,
    );
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        location: newUser.location,
      },
    };
  }

  async login(user: SafeUser, response: Response) {
    const { accessToken, refreshToken } = await this.generateTokens(user);
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);
    await this.setCookies(response, accessToken, refreshToken);
    this.logger.log(`User ${user.id} logged in successfully`, AuthService.name);
    const loggedUser = await this.usersService.findOneById(user.id);
    return {
      user: {
        id: loggedUser.id,
        email: loggedUser.email,
        role: loggedUser.role,
        firstName: loggedUser.firstName,
        lastName: loggedUser.lastName,
        location: loggedUser.location,
      },
    };
  }

  async logout(response: Response, userId: number) {
    await this.usersService.clearRefreshToken(userId);
    this.clearAuthCookie(response);
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);

    const passwordValid = await compare(password, user.password);

    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async verifyUserRefreshToken(refreshToken: string, userId: number) {
    const user = await this.usersService.findOneById(userId);
    if (!user?.refreshToken) throw new UnauthorizedException();

    const validToken = await compare(refreshToken, user?.refreshToken);
    if (!validToken) throw new UnauthorizedException();

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private async setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const expires = new Date();

    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ) as unknown as ms.StringValue,
        ),
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    response.cookie('Authentication', accessToken, {
      ...cookieOptions,
      expires,
      sameSite: 'none',
    });

    response.cookie('Refresh', refreshToken, {
      ...cookieOptions,
      maxAge: parseInt(
        this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
      ),
    });
  }

  private async generateTokens(user: SafeUser) {
    const tokenPayload: TokenPayload = { userId: user.id.toString() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        ),
      }),
      this.jwtService.signAsync(tokenPayload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        ),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private clearAuthCookie(response: Response): void {
    const cookieOption = {
      httpOnly: true,
      secure: true,
    };

    response.clearCookie('Authentication', cookieOption);
    response.clearCookie('Refresh', cookieOption);
  }
}
