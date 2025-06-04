import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ProfileDto } from './dtos/profile.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DeleteOwnProfileDto } from './dtos/delete-own-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

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
    return this.profilesService.updateProfile(
      user.id.toString(),
      updateProfileDto,
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
}
