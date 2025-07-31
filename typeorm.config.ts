import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Application } from 'src/applications/entities/application.entity';
import { Job } from 'src/jobs/entites/job.entity';
import { User } from 'src/users/entities/user.entity';

import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: parseInt(configService.get('DATABASE_PORT') || '5432', 10),
  database: configService.get('DATABASE_NAME'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  migrations: ['migrations/**'],
  entities: [User, Job, Application],
});
