import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { gql } from './graphql';
import { TenantEntity } from 'src/modules/tenants/tenant.entity';
import { UserEntity, UserRole } from 'src/modules/users/user.entity';

type TestContext = {
  adminTenantId: string;
  adminToken: string;
  adminUserId: string;
  adminEmail: string;
  adminPassword: string;
};

let cached: TestContext | null = null;

export async function getTestContext(app: INestApplication): Promise<TestContext> {
  if (cached) return cached;

  const ds = app.get(DataSource);
  const tenantRepo = ds.getRepository(TenantEntity);
  const userRepo = ds.getRepository(UserEntity);

	// need an 'admin' tenant to create other tenants
  let adminTenant = await tenantRepo.findOne({ where: { name: 'admin' } });
  if (!adminTenant) {
    adminTenant = await tenantRepo.save(tenantRepo.create({ name: 'admin' }));
  }

  const adminEmail = 'it@test.com';
  const adminPassword = 'Admin@123';

  let adminUser = await userRepo.findOne({ where: { email: adminEmail } });
  if (!adminUser) {
    adminUser = await userRepo.save(
      userRepo.create({
        tenantId: adminTenant.id,
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        role: UserRole.ADMIN,
      }),
    );
  }

  // login and cache token
  const res = await gql(app.getHttpServer(), {
    tenantId: adminTenant.id,
    query: `
      mutation($input: LoginInput!) {
        login(input: $input) {
          accessToken
          user { id }
        }
      }
    `,
    variables: { input: { email: adminEmail, password: adminPassword } },
  });

  const adminToken = res.body.data.login.accessToken;

  cached = {
    adminTenantId: adminTenant.id,
    adminToken,
    adminUserId: adminUser.id,
    adminEmail,
    adminPassword,
  };

  return cached;
}