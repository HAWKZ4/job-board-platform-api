import { UsersService } from 'src/users/users.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { ProfileDto } from './dtos/profile.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SingleUserResponseDto } from 'src/admin/dtos/users/single-user-response.dto';
import { ProfileResponseDto } from './dtos/profile-response.dto';
import { UploadResumeDto } from './dtos/upload-resume.dto';

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
    type: SingleUserResponseDto,
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
  async getMe(
    @CurrentUser() user: SafeUser,
    @Req() req: any,
  ): Promise<UserDto> {
    const exisitingUser = await this.usersService.findOneById(user.id);
    if (!exisitingUser) throw new NotFoundException('User not found');
    req.customMessage = 'Authenticated user retrieved successfully';
    return exisitingUser;
  }

  @ApiOperation({ summary: 'Update my profile' })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
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
    @Req() req: any,
  ): Promise<ProfileDto> {
    const updatedProfile = this.profilesService.update(user.id, dto);
    req.customMessage = 'Profile updated successfully';
    return updatedProfile;
  }

  @ApiOperation({ summary: 'Delete my profile' })
  @ApiOkResponse({
    description: 'Profile deleted successfully',
    example: {
      statusCode: 200,
      message: 'Profile deleted successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated or Your password is invalid.',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteProfile(
    @CurrentUser() user: User,
    @Body() dto: DeleteProfileDto,
    @Res({ passthrough: true }) response: Response,
    @Req() req: any,
  ): Promise<void> {
    await this.profilesService.delete(user.id, dto);
    await this.authService.logout(response, user.id);
    req.customMessage = 'Profile deleted successfully';
  }

  @ApiOperation({ summary: 'Update my password' })
  @ApiOkResponse({
    description: 'Password updated successfully',
    example: {
      statusCode: 200,
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
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
    @Req() req: any,
  ): Promise<void> {
    await this.profilesService.changePassword(user.id, dto);
    req.customMessage = 'Password updated successfully';
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
        statusCode: 200,
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
        // Byte => KB => etc...
        fileSize: 1000 * 1000 * 5, // 5MB
      },
      fileFilter: pdfFileFilter,
    }),
  )
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: SafeUser,
    @Req() req: any,
  ): Promise<void> {
    if (!file) throw new BadRequestException('No file uploaded');

    const relativeResumePath = `/uploads/resumes/${file.filename}`;

    this.logger.log(
      `User ${user.id} uploaded resume: ${relativeResumePath}`,
      ProfilesController.name,
    );

    await this.profilesService.updateUserResumeUrl(user.id, relativeResumePath);
    req.customMessage = 'Resume uploaded successfully';
  }

  @ApiOperation({
    summary: 'Serve resume PDF by filename for the authenticated user',
  })
  @ApiParam({
    name: 'filename',
    description: 'The filename of the resume to retrieve',
    example: 'resume_123.pdf',
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
  @ApiNotFoundResponse({ description: 'Resume not found or access denied' })
  @ApiInternalServerErrorResponse({
    description: 'File delivery failed due to server error',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/resumes/:filename')
  async serveResume(
    @Param('filename') filename: string,
    @CurrentUser() user: SafeUser,
    @Res() response: Response,
  ): Promise<void> {
    const filePath = await this.profilesService.verifyUserResumeAccess(
      user,
      filename,
    );

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    return new Promise<void>((resolve, reject) => {
      response.sendFile(filePath, (err) => {
        if (err) {
          reject(new InternalServerErrorException('File delivery failed'));
        } else {
          resolve(); // Success
        }
      });
    });
  }
}
