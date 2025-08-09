import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserApplicationDto } from './dtos/user-application.dto';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserApplicationResponseDto } from './dtos/user-application-response.dto';
import { PaginatedUserApplicationsResponseDto } from './dtos/paginated-user-applications-response.dto';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  private readonly logger = new MyLoggerService(ApplicationsController.name);

  @ApiOperation({ summary: 'Apply to job (create application)' })
  @ApiOkResponse({
    description: 'Application created successfully',
    type: UserApplicationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiNotFoundResponse({
    description: 'Job not found or User not found',
  })
  @Serialize(UserApplicationDto)
  @UseGuards(JwtAuthGuard)
  @Post()
  async applyToJob(
    @CurrentUser() user: SafeUser,
    @Body() dto: CreateApplicationDto,
    @Req() req: any,
  ) {
    this.logger.log(
      `User ${user.id} is applying to Job ${dto.jobId}`,
      ApplicationsService.name,
    );

    const createdApplication = await this.applicationsService.create(dto, user);
    req.customMessage = 'Application created successfully';
    return createdApplication;
  }

  @ApiOperation({ summary: 'Get all my applications' })
  @ApiOkResponse({
    description:
      'List of user applications fetched successfully with pagination metadata',
    type: PaginatedUserApplicationsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllMyApplications(
    @CurrentUser() user: SafeUser,
    @Query() query: PaginationQueryDto,
    @Req() req: any,
  ): Promise<Pagination<UserApplicationDto>> {
    const myApplications = await this.applicationsService.findAllMine(
      user,
      query,
    );
    req.customMessage = 'Applications retrieved successfully';
    return myApplications;
  }

  @ApiOperation({ summary: 'Get an application by ID' })
  @ApiOkResponse({
    description: 'User with the specified email was retrieved successfully',
    type: UserApplicationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiNotFoundResponse({
    description: 'Application not found, or related job/user is missing',
  })
  @Serialize(UserApplicationDto)
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getApplication(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<UserApplicationDto> {
    const application = await this.applicationsService.findOneByUser(id);
    req.customMessage = 'Application retrieved successfully';
    return application;
  }

  @ApiOperation({ summary: 'Delete an Application by ID' })
  @ApiOkResponse({
    description: 'Application withdrawn successfully',
    example: {
      statusCode: 200,
      message: 'Application withdrawn successfully',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'You are not authenticated. Please login first.',
  })
  @ApiNotFoundResponse({
    description: 'Application not found',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('/:id/withdraw')
  async withdrawApplication(
    @CurrentUser() user: SafeUser,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<void> {
    await this.applicationsService.withdraw(id, user);
    req.customMessage = 'Application withdrawn successfully';
  }
}
