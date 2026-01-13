import { UsersService } from 'src/users/users.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ProfileDto } from './dtos/profile.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DeleteProfileDto } from './dtos/delete-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { diskStorage } from 'multer';
import { RESUME_UPLOADS_DIR } from '../common/constatns/file-paths';
import { fileNameEditor, pdfFileFilter } from '../common/utils/file.utils';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { UserDto } from 'src/common/dtos/user/user.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UploadResumeDto } from './dtos/upload-resume.dto';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  private readonly logger = new MyLoggerService(ProfilesController.name);

  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({
    description: 'Authenticated user retrieved successfully',
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @Serialize(UserDto)
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@CurrentUser() user: SafeUser) {
    return this.usersService.findOneById(user.id);
  }

  @ApiOperation({ summary: 'Update my profile' })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: ProfileDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiNotFoundResponse({
    description: 'Profile not found',
  })
  @Serialize(ProfileDto)
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateProfile(
    @CurrentUser() user: SafeUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.update(user.id, dto);
  }

  @ApiOperation({ summary: 'Delete my profile' })
  @ApiNoContentResponse({
    description: 'Profile deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated or Your password is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Profile not found',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete()
  async deleteProfile(
    @CurrentUser() user: SafeUser,
    @Body() dto: DeleteProfileDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.profilesService.softDelete(user.id, dto);
    await this.authService.logout(response, user.id);
  }

  @ApiOperation({ summary: 'Update my password' })
  @ApiOkResponse({
    description: 'Password updated successfully',
    example: {
      message: 'Password updated successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'You are not authenticated or Your current password is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('/change-password')
  async changePassword(
    @CurrentUser() user: SafeUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.profilesService.changePassword(user.id, dto);
    return {
      message: 'Password updated successfully',
    };
  }

  @ApiOperation({ summary: 'Upload or replace user resume (PDF only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'PDF file to upload (max 5MB)',
    type: UploadResumeDto,
  })
  @ApiOkResponse({
    description:
      'Resume uploaded successfully (existing resume will be replaced if exists)',
    schema: {
      example: {
        message: 'Resume uploaded successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'No file uploaded or file is not a valid PDF',
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('/upload-resume')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        filename: fileNameEditor,
        destination: RESUME_UPLOADS_DIR,
      }),
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
      fileFilter: pdfFileFilter,
    }),
  )
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: SafeUser,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const relativeResumePath = `/uploads/resumes/${file.filename}`;

    this.logger.log(
      `User ${user.id} uploaded resume: ${relativeResumePath}`,
      ProfilesController.name,
    );

    await this.profilesService.updateUserResumeUrl(user.id, relativeResumePath);
    return {
      message: 'Resume uploaded successfully',
    };
  }

  @ApiOperation({
    summary: 'Serve resume PDF by filename for the authenticated user',
  })
  @ApiParam({
    name: 'filename',
    description: 'The filename of the resume to retrieve',
    example: 'resume-123.pdf',
  })
  @ApiOkResponse({
    description: 'PDF resume file served successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiInternalServerErrorResponse({
    description: 'File delivery failed due to server error',
  })
  @ApiNotFoundResponse({ description: 'Resume not found or access denied' })
  @UseGuards(JwtAuthGuard)
  @Get('/resumes/:filename')
  async serveResume(
    @Param('filename') filename: string,
    @CurrentUser() user: SafeUser,
    @Res() response: Response,
  ) {
    return this.profilesService.serveResume(filename, user, response);
  }
}
