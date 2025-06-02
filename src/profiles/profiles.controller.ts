import { Controller, Get, Param } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ProfileDto } from './dtos/profile.dto';

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
}
