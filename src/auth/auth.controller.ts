import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { RegisterUserDto } from './dtos/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { LoginRequestTransformGuard } from './guards/login-request-trasnform.guard';
import { SetResponseMessage } from 'src/common/decorators/set-response-message.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: SafeUser,
  ): Promise<void> {
    await this.authService.logout(response, user.id);
  }

  @UseGuards(LoginRequestTransformGuard())
  @SetResponseMessage('User logged in successfully')
  @HttpCode(200)
  @Post('login')
  async login(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: SafeUser,
  ): Promise<void> {
    await this.authService.login(user, response);
  }

  @HttpCode(201)
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<SafeUser> {
    return await this.authService.register(registerUserDto);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(200)
  @Post('refresh')
  async refreshToken(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: SafeUser,
  ): Promise<void> {
    await this.authService.login(user, response);
  }
}
