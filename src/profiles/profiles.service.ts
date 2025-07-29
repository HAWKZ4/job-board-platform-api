import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class ProfilesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async update(id: number, dto: UpdateProfileDto): Promise<User> {
    return this.usersService.updateFromProfile(id, dto);
  }

  async delete(id: number, dto: DeleteProfileDto): Promise<void> {
    const user = await this.usersService.findOneById(id);

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await compare(dto.password, user.password);

    if (!isMatch) throw new UnauthorizedException('Invalid password');

    await this.usersService.delete(user.id, false);
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new NotFoundException('User not found');
    const isMatch = await compare(dto.currentPassword, user.password);

    if (!isMatch) throw new UnauthorizedException('Current password incorrect');

    await this.usersService.changePassword(user, dto);
  }

  async updateUserResumeUrl(userId: number, resumeUrl: string): Promise<void> {
    await this.usersService.updateResume(userId, resumeUrl);
  }

  async verifyUserResumeAccess(
    user: SafeUser,
    filename: string,
  ): Promise<string> {
    // 1. Validate filename
    if (!this.isValidFilename(filename)) {
      throw new ForbiddenException('Invalid filename format');
    }

    // 2. Get configured directory
    const resumesDir =
      this.configService.getOrThrow<string>('RESUME_UPLOAD_PATH');

    // 3. Create directory if it doesn't exist
    await this.ensureDirectoryExists(resumesDir);

    // 4. Create safe absolute path
    const absolutePath = path.resolve(resumesDir, filename);

    // 5. Verify file exists and is readable
    try {
      await fs.access(absolutePath, fs.constants.R_OK);
    } catch (error) {
      console.error(`File access error for ${filename}: ${error.message}`);
      throw new NotFoundException('Resume not found');
    }

    // 6. Authorization checks
    const userWithInfo = await this.usersService.findOneById(user.id);
    if (!userWithInfo) throw new NotFoundException('User not found');

    this.checkUserAuthorization(userWithInfo, filename);

    return absolutePath;
  }

  private isValidFilename(filename: string): boolean {
    return VALID_FILENAME_REGEX.test(filename);
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
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
}
