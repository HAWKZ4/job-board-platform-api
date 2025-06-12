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
import { NoDataResponse } from 'src/common/dtos/no-data-response.dto';
import { SuccessResponse } from 'src/common/dtos/response.dto';
import { UserDto } from 'src/users/dtos/user.dto';
import { transformToDto } from 'src/utils/transform-to-dto';
import { SafeUserDto } from 'src/users/dtos/safe-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: SafeUserDto
  ): Promise<NoDataResponse> {
    await this.authService.logout(response, user.id);

    return new NoDataResponse('Logged out successfully');
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: SafeUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SuccessResponse<UserDto>> {
    const fullUser = await this.authService.login(user, response);

    return new SuccessResponse(
      'Logged in successfully',
      transformToDto(UserDto, fullUser),
    );
  }

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<NoDataResponse> {
    await this.authService.register(registerUserDto);
    return new NoDataResponse('Account created successfully');
  }

  @HttpCode(200)
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<NoDataResponse> {
    await this.authService.login(user, response);
    return new NoDataResponse('Token refreshed successfully');
  }
}
