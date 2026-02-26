import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './helpers/setup';
import { gql } from './helpers/graphql';
import { getTestContext } from './helpers/common-context';
import { RedisService } from 'src/infrastructure/redis/redis.service';

describe('Rate limit (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApp();
    await app.get(RedisService).flushDb(); // clear the cashe to ensure clean slate for rate limit tests
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows 20 mutations/min per user+tenant, blocks the 21st with 429', async () => {
    const ctx = await getTestContext(app);

    const mutation = `
      mutation CreateCourse($input: CreateCourseInput!) {
        createCourse(input: $input) { id }
      }
    `;

    // 20 should pass
    for (let i = 0; i < 20; i++) {
      const res = await gql(app.getHttpServer(), {
        tenantId: ctx.adminTenantId,
        token: ctx.adminToken,
        query: mutation,
        variables: {
          input: {
            title: `RL ${Date.now()}-${i}`,
            description: 'x',
          },
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data?.createCourse?.id).toBeTruthy();
    }

    // 21st should be rate-limited
    const blocked = await gql(app.getHttpServer(), {
      tenantId: ctx.adminTenantId,
      token: ctx.adminToken,
      query: mutation,
      variables: {
        input: {
          title: `RL ${Date.now()}-BLOCKED`,
          description: 'x',
        },
      },
    });

    const isHttp429 = blocked.status === 429;

    expect(isHttp429).toBe(true);
  });
});