import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApplicationStatus } from '../enums/application-status.enum';
import { User } from 'src/users/entities/user.entity';
import { Job } from 'src/jobs/entites/job.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cover_letter' })
  coverLetter: string;

  @Column({ name: 'resume_path' })
  resumePath: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @ManyToOne(() => User, (user) => user.applications, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Job, (job) => job.applications, {
    eager: true,
    onDelete: 'CASCADE',
  })
  job: Job;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
