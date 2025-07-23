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

  async create(createApplicationDto: CreateApplicationDto, safeUser: SafeUser) {
    const { jobId, coverLetter } = createApplicationDto;
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
    });

    if (!job) throw new NotFoundException('Job not found');

    const user = await this.userRepo.findOne({
      where: { id: safeUser.id },
    });

    if(!user) throw new NotFoundException("User not found")

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
}
