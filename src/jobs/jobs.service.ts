import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entites/job.entity';
import { IsNull, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreateJobDto } from './dtos/create-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobRepo: Repository<Job>,
  ) {}

  // User-Methods
  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Job>> {
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 1;

    const [jobs, total] = await this.jobRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findJobByIdForUser(id: number): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id, isPublished: true, deletedAt: IsNull() },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  // Admin-Methods
  async findOneByIdForAdmin(id: number): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const newJob = this.jobRepo.create({ ...createJobDto });
    return await this.jobRepo.save(newJob);
  }

  async delete(id: number, force: boolean = false): Promise<void> {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');

    if (force) {
      await this.jobRepo.remove(job);
    } else {
      await this.jobRepo.softDelete(id);
    }
  }
}
