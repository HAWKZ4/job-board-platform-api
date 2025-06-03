import { Injectable } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';

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
}
