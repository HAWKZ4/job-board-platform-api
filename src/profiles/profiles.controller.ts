import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { ProfilesService } from './profiles.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ProfileDto } from './dtos/profile.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DeleteOwnProfileDto } from './dtos/delete-own-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { resumeUploadOptions } from 'src/config/resume-upload.config';
import { SuccessResponse } from 'src/common/dtos/response.dto';
import { transformToDto } from 'src/utils/transform-to-dto';
import { UserDto } from 'src/users/dtos/user.dto';
import { ResumeUploadResponseDto } from './dtos/resume-upload-response.dto';
import { Role } from 'src/common/role.enum';
import { Response } from 'express';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Serialize(ProfileDto)
  @Get()
  async getAllProfiles() {
    return this.profilesService.getAllProfiles();
  }
  @Serialize(ProfileDto)
  @Get('/:id')
  async getProfile(@Param('id') id: string) {
    return this.profilesService.getUserProfile(id);
  }
  @Serialize(ProfileDto)
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.profilesService.updateProfile(
      user.id.toString(),
      updateProfileDto,
    );

    return new SuccessResponse(
      'User updated successfully',
      transformToDto(UserDto, updatedUser),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteOwnProfile(
    @CurrentUser() user: User,
    @Body() deleteOwnProfileDto: DeleteOwnProfileDto,
  ) {
    return this.profilesService.deleteOwnProfile(user.id, deleteOwnProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.profilesService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/upload-resume')
  @UseInterceptors(FileInterceptor('file', resumeUploadOptions))
  async uploadResume(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Resume file is required');

    const existingUser = await this.profilesService.getUserProfile(
      user.id.toString(),
    );
    if (existingUser.resume_url !== null) {
      // Clean up the file that was just uploaded
      const uploadedPath = path.join(process.cwd(), file.path);
      fs.unlink(uploadedPath, (err) => {
        if (err) console.warn('Falied to delete unwanted resume:', err.message);
      });

      throw new BadRequestException(
        'Resume already uploaded. Use /update-resume',
      );
    }

    try {
      const resumeUrl = `/uploads/resumes/${file.filename}`;
      await this.profilesService.updateResume(user.id, resumeUrl);
      return new SuccessResponse(
        'Resume uploaded successfully',
        transformToDto(ResumeUploadResponseDto, { resumeUrl }),
      );
    } catch (err) {
      console.error('Upload error', err);
      throw new InternalServerErrorException(
        'Something went wrong while uploading the resume',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-resume')
  @UseInterceptors(FileInterceptor('file', resumeUploadOptions))
  async updateResume(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Resume file is required');

    const userId = user.id;
    const existingUser = await this.profilesService.getUserProfile(
      userId.toString(),
    );

    if (!existingUser.resume_url) {
      // Clean up the file that was just uploaded
      const uploadedPath = path.join(process.cwd(), file.path);
      fs.unlink(uploadedPath, (err) => {
        if (err) console.warn('Falied to delete unwanted resume:', err.message);
      });

      throw new BadRequestException("There's no resume to be updated");
    }

    const oldResume = existingUser.resume_url;

    const resumeUrl = `/uploads/resumes/${file.filename}`;
    await this.profilesService.updateResume(existingUser.id, resumeUrl);

    if (oldResume) {
      const fullPath = path.join(process.cwd(), oldResume);
      fs.unlink(fullPath, (err) => {
        if (err) console.warn('Old resume deletion failed', err.message);
      });
    }

    return new SuccessResponse(
      'Resume updated successfully',
      transformToDto(ResumeUploadResponseDto, { resumeUrl }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/resumes/:filename')
  async getResume(
    @Param('filename') filename: string,
    @CurrentUser() user: User,
    @Res() response: Response,
  ) {
    const resumePath = path.join(process.cwd(), 'uploads', 'resumes', filename);

    if (!fs.existsSync(resumePath))
      throw new NotFoundException('Resume not found');

    if (user.role === Role.ADMIN) return response.sendFile(resumePath);

    if (!user.resume_url)
      throw new ForbiddenException('You have not uploaded a resume');

    // Allow user to view their own resume only
    const isOwnResume = filename === path.basename(user.resume_url);

    if (!isOwnResume) {
      throw new ForbiddenException('You can only access your own resume');
    }

    return response.sendFile(resumePath);
  }
}
