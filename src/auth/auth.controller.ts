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

import {
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginUserResponseDto } from './dtos/login-user-response.dto';
import { SafeUserResponseDto } from 'src/common/dtos/user/safe-user-response.dto';
import { LoginUserRequestDto } from './dtos/login-user-request.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Log out the currently authenticated user' })
  @ApiOkResponse({
    description:
      'User logged out successfully. All authentication cookies have been cleared.',
    example: { message: 'User logged out successfully' },
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('/logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: SafeUser,
  ) {
    await this.authService.logout(response, user.id);
    return {
      message: 'User logged out successfully',
    };
  }

  @ApiOperation({ summary: 'Log in a user and issue authentication tokens' })
  @ApiOkResponse({
    description:
      'User logged in successfully. Access and refresh tokens are set as HTTP-only cookies.',
    type: LoginUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password.',
  })
  @ApiNotFoundResponse({
    description: 'User not found. Please check your credentials.',
  })
  @ApiBody({ type: LoginUserRequestDto })
  @UseGuards(LoginRequestTransformGuard())
  @HttpCode(200)
  @Post('/login')
  async login(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: SafeUser,
  ) {
    return this.authService.login(user, response);
  }

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiOkResponse({
    description: 'User registered successfully.',
    type: SafeUserResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email address already exists.',
  })
  @HttpCode(201)
  @Post('/register')
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(dto, response);
  }

  @ApiOperation({
    summary: 'Refresh the access token using a valid refresh token',
  })
  @ApiOkResponse({
    description:
      'Access token refreshed successfully. New token is set as an HTTP-only cookie.',
    type: SafeUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description:
      'You are not authenticated or your refresh token is invalid/expired.',
  })
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(200)
  @Post('/refresh')
  async refreshToken(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: SafeUser,
  ) {
    return this.authService.login(user, response);
  }
}
