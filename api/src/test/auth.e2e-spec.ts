import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './helpers/setup';
import { gql } from './helpers/graphql';
import { getTestContext } from './helpers/common-context';

describe('Auth tests', () => {
  let app: INestApplication;

  let tenantId;
  let email;
  let password;

  beforeAll(async () => {
    app = await createE2eApp();
		const context = await getTestContext(app);

		tenantId = context.adminTenantId;
		email = context.adminEmail;
		password = context.adminPassword;
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in and returns access token', async () => {
    const res = await gql(app.getHttpServer(), {
      tenantId,
      query: `
        mutation($input: LoginInput!) {
          login(input: $input) {
            accessToken
            user { id email role tenantId }
          }
        }
      `,
      variables: { input: { email, password } },
    });

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.login.accessToken).toBeTruthy();
    expect(res.body.data.login.user.email).toBe(email);
  });
});