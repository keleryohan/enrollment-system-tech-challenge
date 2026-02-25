// inicial script just to create the initial tenant and admin user (since only admin users can create either) 
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';

import { TenantEntity } from '../../modules/tenants/tenant.entity';
import { UserEntity, UserRole } from '../../modules/users/user.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);

    const tenantRepo = dataSource.getRepository(TenantEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    // creating the first tenant
    let tenant = await tenantRepo.findOne({ where: { name: 'admin' } });
    if (!tenant) {
      tenant = tenantRepo.create({ name: 'admin' });
      tenant = await tenantRepo.save(tenant);
      console.log(`[seed] created tenant: ${tenant.name} (${tenant.id})`);
    } else {
      console.log(`[seed] tenant exists: ${tenant.name} (${tenant.id})`);
    }

    // creating the first admin user
    const email = 'it@test.com';
    const plainPassword = 'Minhasenha123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    let user = await userRepo.findOne({ where: { email } });
    if (!user) {
      user = userRepo.create({
        tenantId: tenant.id,
        tenant,
        email,
        password: passwordHash as any,
        role: UserRole.ADMIN,
      });

      user = await userRepo.save(user);
      console.log(`[seed] created admin user: ${user.email} (${user.id})`);
    } else {
      console.log(`[seed] user already exists: ${user.email} (${user.id})`);
    }
  } finally {
    await app.close();
  }
}

seed().catch((err) => {
  console.error('[seed] err:', err);
  process.exit(1);
});
