import { Injectable } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly usersService: UsersService) {}
  async getAllProfiles() {
    return this.usersService.getAllUsers();
  }
}
