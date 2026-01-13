import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entites/job.entity';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';
import { AdminJobDto } from '../admin/dtos/jobs/admin-job.dto';
import { paginateAndMap } from 'src/common/utils/pagination';
import { UserJobDto } from './dtos/user-job.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination/pagination-query.dto';
import { AdminJobQueryDto } from '../admin/dtos/jobs/admin-job-query.dto';
import { AdminSingleJobQueryDto } from 'src/admin/dtos/jobs/admin-single-job-query.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
  ) {}

  // User-Methods
  async findAllForUser(dto: PaginationQueryDto) {
    const { page = 1, limit = 10 } = dto;

    const qb = this.jobRepo
      .createQueryBuilder('job')
      .where('job.deletedAt IS NULL')
      .orderBy('job.createdAt', 'DESC');

    return paginateAndMap(
      qb,
      {
        page,
        limit,
      },
      UserJobDto,
    );
  }

  private async findOneById(id: number, includeDeleted = false) {
    const job = await this.jobRepo.findOne({
      where: {
        id,
      },
      withDeleted: includeDeleted,
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async findOneForUser(id: number) {
    return this.findOneById(id);
  }

  // Admin-Methods
  async findAllForAdmin(dto: AdminJobQueryDto) {
    const { page = 1, limit = 10, showDeleted, company, location, title } = dto;

    const qb = this.jobRepo
      .createQueryBuilder('job')
      .orderBy('job.createdAt', 'DESC');

    if (showDeleted) qb.withDeleted();

    if (company)
      qb.andWhere('job.comapny ILIKE company', { company: `%${company}%` });

    if (location) {
      qb.andWhere('job.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    if (title) {
      qb.andWhere('job.title ILIKE :title', { title: `%${title}%` });
    }

    return paginateAndMap<Job, AdminJobDto>(
      qb,
      {
        page,
        limit,
      },
      AdminJobDto,
    );
  }

  async findOneForAdmin(id: number, dto?: AdminSingleJobQueryDto) {
    return this.findOneById(id, dto?.showDeleted);
  }

  async create(dto: CreateJobDto) {
    const newJob = this.jobRepo.create({ ...dto });
    return await this.jobRepo.save(newJob);
  }

  async update(id: number, dto: UpdateJobDto) {
    const job = await this.findOneForAdmin(id);

    Object.assign(job, dto);
    await this.jobRepo.save(job);

    return this.findOneForAdmin(job.id);
  }

  async restoreForAdmin(id: number) {
    const result = await this.jobRepo.restore(id);
    if (result.affected === 0) {
      throw new NotFoundException('Job not found or already active');
    }
  }

  async softDeleteForAdmin(id: number) {
    await this.findOneById(id); // throws 404 if not found
    await this.jobRepo.softDelete(id);
  }
}
