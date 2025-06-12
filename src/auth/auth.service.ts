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
import { SafeUserDto } from 'src/users/dtos/safe-user.dto';

@Injectable()
export class AuthService {
  private readonly inProduction: boolean;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.inProduction =
      this.configService.getOrThrow('NODE_ENV') === 'production';
  }

  async register(registerUserDto: RegisterUserDto): Promise<void> {
    await this.usersService.createUser({
      ...registerUserDto,
      role: Role.USER,
    });
  }

  async login(user: SafeUserDto, response: Response): Promise<User> {
    const { accessToken, refreshToken } = await this.generateTokens(user);
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);
    await this.setCookies(response, accessToken, refreshToken);
    return this.usersService.getUser({ id: user.id });
  }

  async logout(response: Response, userId: number): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
    this.clearAuthCookie(response);
  }

  private async setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    const cookieOptions = {
      httpOnly: true,
      secure: this.inProduction,
      sameSite: 'strict' as const,
    };

    response.cookie('Authentication', accessToken, {
      ...cookieOptions,
      maxAge: parseInt(
        this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
      ),
    });

    response.cookie('Refresh', refreshToken, {
      ...cookieOptions,
      maxAge: parseInt(
        this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
      ),
    });
  }

  private async generateTokens(
    user: SafeUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = { userId: user.id.toString() };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        ),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async verifyUser(email: string, password: string): Promise<SafeUserDto> {
    const user = await this.usersService.getUser({ email });
    if (!user) throw new UnauthorizedException('Credentials are not valid');

    const passwordValid = await compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async verifyUserRefreshToken(refreshToken: string, userId: number) {
    const user = await this.usersService.getUser({ id: userId });
    if (!user?.refreshToken) throw new UnauthorizedException();

    const validToken = await compare(refreshToken, user?.refreshToken);
    if (!validToken) throw new UnauthorizedException();

    return user;
  }

  private clearAuthCookie(response: Response): void {
    const cookieOption = {
      httpOnly: true,
      secure: this.inProduction,
      sameSite: 'strict' as const,
    };

    response.clearCookie('Authentication', cookieOption);
    response.clearCookie('Refresh', cookieOption);
  }
}
