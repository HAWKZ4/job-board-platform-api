import { UsersService } from 'src/users/users.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SingleUserResponseDto } from 'src/admin/dtos/users/single-user-response.dto';

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

  @Serialize(ProfileDto)
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateProfile(
    @CurrentUser() user: SafeUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileDto> {
    return this.profilesService.update(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete()
  async deleteProfile(
    @CurrentUser() user: User,
    @Body() dto: DeleteProfileDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.profilesService.delete(user.id, dto);
    await this.authService.logout(response, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.profilesService.changePassword(user.id, dto);
  }

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
  ): Promise<void> {
    if (!file) throw new BadRequestException('No file uploaded');

    const relativeResumePath = `/uploads/resumes/${file.filename}`;

    this.logger.log(
      `User ${user.id} uploaded resume: ${relativeResumePath}`,
      ProfilesController.name,
    );

    await this.profilesService.updateUserResumeUrl(user.id, relativeResumePath);
  }

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
