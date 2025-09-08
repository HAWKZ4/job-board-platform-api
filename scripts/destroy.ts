import dataSource from '../typeorm.config';

import { Application } from 'src/applications/entities/application.entity';
import { Job } from 'src/jobs/entites/job.entity';
import { User } from 'src/users/entities/user.entity';

async function destroy() {
  await dataSource.initialize();

  await dataSource
    .getRepository(Application)
    .createQueryBuilder()
    .delete()
    .execute();

  await dataSource.getRepository(Job).createQueryBuilder().delete().execute();
  await dataSource.getRepository(User).createQueryBuilder().delete().execute();

  console.log('✅ All data destroyed');
  await dataSource.destroy();
}

destroy().catch((err) => {
  console.error('❌ Destroy failed:', err);
  process.exit(1);
});
