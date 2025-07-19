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
import { User } from 'src/users/entities/user.entity';

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

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    return await this.usersService.create({
      ...registerUserDto,
      role: UserRole.USER,
    });
  }

  async login(user: SafeUser, response: Response): Promise<void> {
    const { accessToken, refreshToken } = await this.generateTokens(user);
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);
    await this.setCookies(response, accessToken, refreshToken);
  }

  async logout(response: Response, userId: number): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
    this.clearAuthCookie(response);
  }

  async verifyUser(email: string, password: string): Promise<SafeUser> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) throw new UnauthorizedException();

    const passwordValid = await compare(password, user.password);

    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async verifyUserRefreshToken(
    refreshToken: string,
    userId: number,
  ): Promise<SafeUser> {
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
    user: SafeUser,
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
