import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserApplicationDto } from './dtos/user-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Serialize(UserApplicationDto)
  @UseGuards(JwtAuthGuard)
  @Post()
  async applyToJob(
    @CurrentUser() user: SafeUser,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(createApplicationDto, user);
  }
}
