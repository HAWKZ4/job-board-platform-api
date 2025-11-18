import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/common/enums/user-role.enum';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserDto } from 'src/common/dtos/user/user.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedUsersResponseDto } from 'src/admin/dtos/users/paginated-users-response.dto';
import { UsersService } from 'src/users/users.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { AdminUserQueryDto } from '../dtos/users/admin-user-query.dto';
import { AdminSingleUserQueryDto } from '../dtos/users/admin-single-user-query.dto';
import { MyLoggerService } from 'src/my-logger/my-logger.service';

@ApiTags('Admin Users')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new MyLoggerService(AdminUsersController.name);

  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiOkResponse({
    description: 'List of users fetched successfully with pagination metadata',
    type: PaginatedUsersResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @Get()
  async getAllUsers(@Query() query: AdminUserQueryDto) {
    return this.usersService.findAllUsers(query);
  }

  @ApiOperation({ summary: 'Get a user by email (admin only)' })
  @ApiOkResponse({
    description: 'User with the specified email was retrieved successfully',
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @Serialize(UserDto)
  @Get('/email/:email')
  async getUserByEmail(
    @Param('email') email: string,
    @Query() query: AdminSingleUserQueryDto,
  ) {
    return this.usersService.findUserByEmail(email, query);
  }

  @ApiOperation({ summary: 'Get a user by ID (admin only)' })
  @ApiOkResponse({
    description: 'User with the specified ID was retrieved successfully',
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @Serialize(UserDto)
  @Get('/:id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: AdminSingleUserQueryDto,
  ) {
    return this.usersService.findUserById(id, query);
  }

  @ApiOperation({ summary: 'Delete a user by ID (soft delete)' })
  @ApiNoContentResponse({
    description: 'User was deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @HttpCode(204)
  @Delete('/:id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: SafeUser,
  ) {
    await this.usersService.deleteUser(id, user);
    this.logger.log(`Admin ${user.id} deleted user: ${id}`);
  }

  @ApiOperation({
    summary: 'Restore a previously soft-deleted user (admin only)',
  })
  @ApiOkResponse({
    description: 'User restored successfully',
    example: {
      message: 'User restored successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiForbiddenResponse({
    description: 'You are not authorized. Admin role is required.',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @Patch('/restore/:id')
  async restoreUser(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.restoreUser(id);
    return {
      message: 'User restored successfully',
    };
  }
}
