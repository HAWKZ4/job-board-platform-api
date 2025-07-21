import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { JobType } from '../enums/job-type.enum';
import { Application } from 'src/applications/entities/application.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column()
  location: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column({
    type: 'enum',
    enum: JobType,
  })
  type: JobType;

  @Column()
  remote: boolean;

  @Column()
  requirements: string;

  @Column({ nullable: true })
  salaryRange: string;

  @Column({ default: true })
  isPublished: boolean;

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
