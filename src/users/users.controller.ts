import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
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
import { SafeUserDto } from './dtos/safe-user.dto';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginatedUserResponseDto } from './dtos/responses/paginated-user-response.dto';
import { SingleUserResponseDto } from './dtos/responses/single-user-response.dto';
import { RestoreDeletedUserResponseDto } from './dtos/responses/restore-deleted-user-response.dto';
import { UpdateUserResponseDto } from './dtos/responses/update-user-response.dto';
import { SafeUserResponseDto } from './dtos/responses/safe-user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private readonly logger = new MyLoggerService(UsersController.name);

  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({
    description: 'Authenticated user retrieved successfully',
    type: SingleUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @Serialize(UserDto)
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(
    @CurrentUser() user: SafeUser,
    @Req() req: any,
  ): Promise<UserDto> {
    const exisitingUser = await this.usersService.findOneById(user.id);
    if (!exisitingUser) throw new NotFoundException('User not found');
    req.customMessage = 'Authenticated user retrieved successfully';
    return exisitingUser;
  }

  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiOkResponse({
    description: 'List of users fetched successfully with pagination metadata',
    type: PaginatedUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllUsers(
    @Query() query: PaginationQueryDto,
    @Req() req: any,
  ): Promise<Pagination<UserDto>> {
    const users = this.usersService.findAll(query);
    req.customMessage = 'Users fetched successfully';
    return users;
  }

  @ApiOperation({ summary: 'Get a user by email (admin only)' })
  @ApiOkResponse({
    description: 'User with the specified email was retrieved successfully',
    type: SingleUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Serialize(UserDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/email/:email')
  async getUserByEmail(
    @Param('email') email: string,
    @Req() req: any,
  ): Promise<UserDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    req.customMessage = 'User retrieved successfully';
    return user;
  }

  @ApiOperation({ summary: 'Get a user by ID (admin only)' })
  @ApiOkResponse({
    description: 'User with the specified ID was retrieved successfully',
    type: SingleUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Serialize(UserDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<UserDto> {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new NotFoundException('User not found');
    req.customMessage = 'User retrieved successfully';
    return user;
  }

  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiOkResponse({
    description: 'User created successfully',
    type: SafeUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Serialize(SafeUserDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createUser(
    @Body() dto: CreateUserDto,
    @Req() req: any,
  ): Promise<SafeUserDto> {
    this.logger.log(
      `Admin created user with email ${dto.email}`,
      UsersController.name,
    );
    req.customMessage = 'User created successfully';
    return await this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Update an existing user (admin only)' })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UpdateUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Serialize(UserDto)
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ): Promise<UserDto> {
    const updatedUser = this.usersService.update(id, dto);
    req.customMessage = 'User updated successfully';
    return updatedUser;
  }

  @ApiOperation({ summary: 'Delete a user by ID (soft or hard delete)' })
  @ApiOkResponse({
    description:
      'User was deleted successfully (soft or hard depending on query param)',
    type: RestoreDeletedUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/:id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Query() force?: 'true' | 'false',
  ): Promise<void> {
    const isForceDelete = force === 'true';
    await this.usersService.delete(id, isForceDelete);
    req.customMessage = isForceDelete
      ? 'User force deleted successfully'
      : 'User soft deleted successfully';
  }

  @ApiOperation({
    summary: 'Restore a previously soft-deleted user (admin only)',
  })
  @ApiOkResponse({
    description: 'User restored successfully',
    type: RestoreDeletedUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/restore/:id')
  async restoreJob(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<void> {
    await this.usersService.restore(id);
    req.customMessage = 'User restored successfully';
  }
}
