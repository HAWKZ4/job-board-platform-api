import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

import dataSource from '../typeorm.config';

import { Application } from '../src/applications/entities/application.entity';
import { Job } from '../src/jobs/entites/job.entity';
import { User } from '../src/users/entities/user.entity';

async function seedFromJson() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const jobRepo = dataSource.getRepository(Job);
  const appRepo = dataSource.getRepository(Application);

  // Clean database before seeding
  await appRepo.createQueryBuilder().delete().execute();
  await jobRepo.createQueryBuilder().delete().execute();
  await userRepo.createQueryBuilder().delete().execute();
  console.log('🧹 Cleared all data');

  const readJson = (filename: string) =>
    JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data', filename), 'utf-8'),
    );

  // Seed Users
  const users: Partial<User>[] = readJson('users.json');
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    const user = userRepo.create({ ...userData, password: hashedPassword });
    await userRepo.save(user);
  }

  // Seed Jobs
  const jobs: Partial<Job>[] = readJson('jobs.json');
  for (const jobData of jobs) {
    const job = jobRepo.create(jobData);
    await jobRepo.save(job);
  }

  console.log('✅ Seeded users and jobs from JSON files');

  await dataSource.destroy();
}

seedFromJson().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
