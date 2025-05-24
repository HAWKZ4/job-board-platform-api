import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Serialize(UserDto)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('/:id')
  async getUser(@Param('id') id: string) {
    return this.usersService.getUser({ id: parseInt(id) });
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Patch('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(parseInt(id), updateUserDto);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(parseInt(id));
  }

  @Get('/profile/:id')
  async viewProfile(@Param('id') id: string) {
    return this.usersService.viewProfile(parseInt(id));
  }

  @Patch('/profile/:id')
  async updateProfile(
    @Param('id') id: string,
    updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(parseInt(id), updateProfileDto);
  }
}
