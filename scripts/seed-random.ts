import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import dataSource from '../typeorm.config';

import { User } from 'src/users/entities/user.entity';
import { Job } from 'src/jobs/entites/job.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JobType } from 'src/jobs/enums/job-type.enum';

async function seedRandom() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const jobRepo = dataSource.getRepository(Job);

  const users: User[] = [];
  const jobs: Job[] = [];

  // Create 10 users
  for (let i = 0; i < 10; i++) {
    const password = await bcrypt.hash('password123', 10);

    const user = userRepo.create({
      email: faker.internet.email(),
      password,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      location: faker.location.city(),
      refreshToken: null,
      role: UserRole.USER,
      resumeUrl: null,
    });

    users.push(await userRepo.save(user));
  }

  // Create 10 jobs
  for (let i = 0; i < 10; i++) {
    const job = jobRepo.create({
      title: faker.person.jobTitle(),
      company: faker.company.name(),
      location: faker.location.city(),
      description: faker.lorem.paragraph(),
      category: faker.commerce.department(),
      type: faker.helpers.arrayElement([
        JobType.FULL_TIME,
        JobType.PART_TIME,
        JobType.CONTRACT,
      ]),
      remote: faker.datatype.boolean(),
      requirements: faker.lorem.sentence(),
      salaryRange: `$${faker.number.int({ min: 40000, max: 100000 })}`,
      isPublished: true,
    });

    jobs.push(await jobRepo.save(job));
  }

  console.log('✅ Seed complete: 10 users, 10 jobs');
  await dataSource.destroy();
}

seedRandom().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
