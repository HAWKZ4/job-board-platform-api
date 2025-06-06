import { Injectable, UnauthorizedException } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { DeleteOwnProfileDto } from './dtos/delete-own-profile.dto';
import { compare } from 'bcryptjs';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProfilesService {
  constructor(private readonly usersService: UsersService) {}
  async getAllProfiles() {
    return this.usersService.getAllUsers();
  }

  async getUserProfile(id: string) {
    return this.usersService.getUser({ id: parseInt(id) });
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateUser(parseInt(id), updateProfileDto);
  }

  async deleteOwnProfile(id: number, dto: DeleteOwnProfileDto) {
    const user = await this.usersService.getUser({ id });
    const isMatch = await compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');
    return this.usersService.deleteUser(user);
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.usersService.getUser({ id });
    const isMatch = await compare(dto.currentPassword, user.password);

    if (!isMatch) throw new UnauthorizedException('Current password incorrect');

    await this.usersService.changePassword(user, dto);
    return { message: 'Password changed successfully' };
  }

  async updateResume(userId: number, resumeUrl: string) {
    await this.usersService.updateUser(userId, { resume_url: resumeUrl });
  }
}
