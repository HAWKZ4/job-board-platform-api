import { Injectable } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly usersService: UsersService) {}
  async getAllProfiles() {
    return this.usersService.getAllUsers();
  }

  async getUserProfile(id: string) {
    return this.usersService.getUser( {id: parseInt(id)} );
  }
}
