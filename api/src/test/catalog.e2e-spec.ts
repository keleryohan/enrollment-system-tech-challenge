import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './helpers/setup';
import { gql } from './helpers/graphql';
import { getTestContext } from './helpers/common-context';

describe('Catalog cache version bump (e2e)', () => {
  let app: INestApplication;
	let tenantId: string;
	let adminToken: string;

  beforeAll(async () => {
		app = await createE2eApp();

		const context = await getTestContext(app);

		tenantId = context.adminTenantId;
		adminToken = context.adminToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('changes catalog results after course create (version bump)', async () => {
    // we call catalog to cache the results and the version
    await gql(app.getHttpServer(), {
      tenantId: tenantId,
      token: adminToken,
      query: `
        query {
          catalog(first: 2) {
            edges { node { id title createdAt } }
            pageInfo { hasNextPage endCursor }
          }
        }
      `,
    });

    // we crate the new course and it should trigger a catalog version bump
    const uniqueTitle = `New Course ${Date.now()}`;
    const created = await gql(app.getHttpServer(), {
      tenantId: tenantId,
      token: adminToken,
      query: `
        mutation($input: CreateCourseInput!) {
          createCourse(input: $input) { id title }
        }
      `,
      variables: { input: { title: uniqueTitle, description: 'x' } },
    });

    expect(created.body.errors).toBeUndefined();

    // we call catalog again, it should have the new course and the old ones should be in the correct order (new course first)
    const secondCatalog = await gql(app.getHttpServer(), {
      tenantId: tenantId,
      token: adminToken,
      query: `
        query {
          catalog(first: 2) {
            edges { node { id title } }
            pageInfo { endCursor }
          }
        }
      `,
    });

		// no errors and we should have the new course in the results
		expect(secondCatalog.status).toBe(200);
    expect(secondCatalog.body.errors).toBeUndefined();

    const afterTitles: string[] = secondCatalog.body.data.catalog.edges.map((e: any) => e.node.title);
		// the new course should be in the results
    expect(afterTitles).toContain(uniqueTitle);

    // and the first one has to be the most recent
    expect(secondCatalog.body.data.catalog.edges[0].node.title).toBe(uniqueTitle);
  });
});