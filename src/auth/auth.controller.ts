import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { RegisterUserDto } from './dtos/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @HttpCode(200)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) response: Response) {
    const inProduction =
      this.configService.getOrThrow('NODE_ENV') === 'production';

    response.clearCookie('Authentication', {
      httpOnly: true,
      secure: inProduction,
      sameSite: 'strict',
    });

    response.clearCookie('Refresh', {
      httpOnly: true,
      secure: inProduction,
      sameSite: 'strict',
    });

    response.json({ message: 'Logged out successfully' });
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    response.json({
      message: 'Logged in successfully',
      data: user.toSafeUser(),
    });
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    await this.authService.register(registerUserDto);
    return {
      message: 'Account created successfully',
    };
  }

  @HttpCode(200)
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    return {
      message: 'Token refreshed successfully',
    };
  }
}
