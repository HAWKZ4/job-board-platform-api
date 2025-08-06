import { UpdateApplicationStatusDto } from './dtos/update-application-status.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Repository } from 'typeorm';
import { Job } from 'src/jobs/entites/job.entity';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { User } from 'src/users/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { UserApplicationDto } from './dtos/user-application.dto';
import { paginateAndMap } from 'src/common/utils/pagination';
import { AdminApplicationQueryDto } from '../admin/dtos/applications/admin-application-query.dto';
import { AdminApplicationDto } from '../admin/dtos/applications/admin-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // User Methods
  async create(dto: CreateApplicationDto, safeUser: SafeUser) {
    const { jobId, coverLetter } = dto;
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
    });

    if (!job) throw new NotFoundException('Job not found');

    const user = await this.userRepo.findOne({
      where: { id: safeUser.id },
    });

    if (!user) throw new NotFoundException('User not found');

    if (!user.resumeUrl)
      throw new BadRequestException('Please upload you resume before applying');

    const exists = await this.appRepo.findOne({
      where: {
        user: { id: user.id },
        job: { id: job.id },
      },
    });

    if (exists)
      throw new ConflictException('You have already applied to this job');

    const application = this.appRepo.create({
      job,
      user,
      resumePath: user.resumeUrl,
      coverLetter,
    });

    return this.appRepo.save(application);
  }

  async findAllMine(
    user: SafeUser,
    dto: PaginationQueryDto,
  ): Promise<Pagination<UserApplicationDto>> {
    const qb = this.appRepo
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .where('application.userId = :userId', { userId: user.id })
      .andWhere('job.deletedAt IS NULL')
      .orderBy('application.createdAt', 'DESC');

    return paginateAndMap<Application, UserApplicationDto>(
      qb,
      dto,
      UserApplicationDto,
    );
  }

  async findOneByUser(id: number): Promise<Application> {
    const application = await this.appRepo.findOne({
      where: { id },
      relations: ['job'],
    });

    if (!application) throw new NotFoundException('Application not found');

    return application;
  }

  async withdraw(applicationId: number, user: SafeUser): Promise<void> {
    const application = await this.appRepo.findOne({
      where: { id: applicationId, user: { id: user.id } },
    });

    if (!application) throw new NotFoundException('Applicaiton not found');

    if (application.deletedAt) {
      throw new ConflictException('Application already withdrawn');
    }

    await this.appRepo.softRemove(application);
  }

  // Admin Methods
  async findAllApplicationsForAdmin(
    dto: AdminApplicationQueryDto,
  ): Promise<Pagination<AdminApplicationDto>> {
    const { jobId, userId } = dto;

    const qb = this.appRepo
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.user', 'user')
      .orderBy('application.createdAt', 'DESC');

    if (jobId) {
      qb.andWhere('application.jobId = :jobId', { jobId });
    }

    if (userId) {
      qb.andWhere('application.userId = :userId', { userId });
    }

    qb.andWhere('job.deletedAt IS NULL');

    return paginateAndMap<Application, AdminApplicationDto>(
      qb,
      dto,
      AdminApplicationDto,
    );
  }

  async findOneByAdmin(id: number): Promise<Application> {
    const application = await this.appRepo.findOne({
      where: { id },
      relations: ['job', 'user'],
    });

    if (!application) throw new NotFoundException('Application not found');

    return application;
  }

  async updateStatus(
    id: number,
    dto: UpdateApplicationStatusDto,
  ): Promise<Application> {
    const application = await this.appRepo.findOne({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');

    application.status = dto.status;
    const savedApplication = await this.appRepo.save(application);
    return savedApplication;
  }
}
