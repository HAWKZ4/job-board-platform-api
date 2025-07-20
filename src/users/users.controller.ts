import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { SafeUserDto } from './dtos/safe-user.dto';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';

@Serialize(UserDto)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@CurrentUser() user: SafeUser): Promise<UserDto> {
    const exisitingUser = await this.usersService.findOneById(user.id);
    if (!exisitingUser) throw new NotFoundException('User not found');
    return exisitingUser;
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllUsers(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserDto>> {
    return this.usersService.findAll(paginationDto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Serialize(SafeUserDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<SafeUserDto> {
    return await this.usersService.create(createUserDto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(204)
  @Delete('/:id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Query() force?: 'true' | 'false',
  ): Promise<void> {
    const isForceDelete = force === 'true';
    await this.usersService.delete(id, isForceDelete);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/restore/:id')
  async restoreJob(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.restore(id);
  }
}
