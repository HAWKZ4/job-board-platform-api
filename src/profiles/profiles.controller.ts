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

@Serialize(ProfileDto)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}
  @Get()
  async getAllProfiles() {
    return this.profilesService.getAllProfiles();
  }

  @Get('/:id')
  async getProfile(@Param('id') id: string) {
    return this.profilesService.getUserProfile(id);
  }

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
}
