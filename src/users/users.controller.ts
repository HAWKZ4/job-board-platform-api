import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { AdminUpdateUserDto } from './dtos/admin-update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/common/role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from './entities/user.entity';
import { SuccessResponse } from 'src/common/dtos/response.dto';
import { transformToDto } from 'src/utils/transform-to-dto';
import { NoDataResponse } from 'src/common/dtos/no-data-response.dto';

@Roles(Role.ADMIN)
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Serialize(UserDto)
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@CurrentUser() user: User) {
    return this.usersService.getUser({ id: user.id });
  }

  @Serialize(UserDto)
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Serialize(UserDto)
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    return this.usersService.getUser({ id: parseInt(id) });
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto):Promise<SuccessResponse<UserDto>> {
    const user = await this.usersService.createUser(createUserDto);
    return new SuccessResponse(
      'User created successfully',
      transformToDto(UserDto, user),
    );
  }

  @Patch('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ) {
    const user = await this.usersService.adminUpdateUser(
      parseInt(id),
      adminUpdateUserDto,
    );
    return new SuccessResponse(
      'User updated successfully',
      transformToDto(UserDto, user),
    );
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string):Promise<NoDataResponse> {
  await this.usersService.deleteUser(parseInt(id));
  return new NoDataResponse('User deleted successfully');
  }
}
