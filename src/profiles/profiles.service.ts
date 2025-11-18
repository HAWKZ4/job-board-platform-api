import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as path from 'path';
import { promises as fs } from 'fs';

import { UsersService } from 'src/users/users.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { DeleteProfileDto } from './dtos/delete-profile.dto';
import { compare } from 'bcryptjs';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { VALID_FILENAME_REGEX } from 'src/common/constatns/constants';
import { User } from 'src/users/entities/user.entity';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { Response } from 'express';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(ProfilesService.name);

  async updateProfile(id: number, dto: UpdateProfileDto) {
    return this.usersService.updateUserProfile(id, dto);
  }

  async deleteProfile(id: number, dto: DeleteProfileDto) {
    const user = await this.usersService.findUserById(id);

    const isMatch = await compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    await this.usersService.deleteUser(user.id);
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.usersService.findUserById(id);

    const isMatch = await compare(dto.currentPassword, user.password);

    if (!isMatch) throw new UnauthorizedException('Current password incorrect');

    await this.usersService.changePassword(user, dto);
  }

  async updateUserResumeUrl(userId: number, resumeUrl: string) {
    await this.usersService.updateUserResume(userId, resumeUrl);
  }

  async verifyUserResumeAccess(user: SafeUser, filename: string) {
    if (!this.isValidFilename(filename)) {
      throw new ForbiddenException('Invalid filename format');
    }

    const resumesDir =
      this.configService.getOrThrow<string>('RESUME_UPLOAD_PATH');

    await this.ensureDirectoryExists(resumesDir);

    const absolutePath = path.resolve(resumesDir, filename);

    try {
      await fs.access(absolutePath, fs.constants.R_OK);
    } catch (error) {
      this.logger.error(`File access error for ${filename}: ${error.message}`);
      throw new NotFoundException('Resume not found');
    }

    const userWithInfo = await this.usersService.findUserById(user.id);

    this.checkUserAuthorization(userWithInfo, filename);

    return absolutePath;
  }

  private isValidFilename(filename: string): boolean {
    return VALID_FILENAME_REGEX.test(filename);
  }

  private async ensureDirectoryExists(dirPath: string) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Could not create directory ${dirPath}: ${error.message}`);
      throw new InternalServerErrorException('Cannot access resume storage');
    }
  }

  private checkUserAuthorization(user: User, filename: string): void {
    if (user.role === UserRole.ADMIN) return;

    if (!user.resumeUrl) {
      throw new NotFoundException('No resume uploaded');
    }

    const userFilename = path.basename(user.resumeUrl);
    if (userFilename !== filename) {
      throw new ForbiddenException('You can only access your own resume');
    }
  }

  async serveResume(filename: string, user: SafeUser, response: Response) {
    const filePath = await this.verifyUserResumeAccess(user, filename);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    return new Promise<void>((resolve, reject) => {
      response.sendFile(filePath, (err) => {
        if (err) {
          reject(new InternalServerErrorException('File delivery failed'));
        } else {
          resolve();
        }
      });
    });
  }
}
