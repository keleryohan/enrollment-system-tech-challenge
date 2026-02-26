import { INestApplication } from '@nestjs/common';
import { createE2eApp } from './helpers/setup';
import { gql } from './helpers/graphql';
import { getTestContext } from './helpers/common-context';

describe('Enroll concurrency tests', () => {
  let app: INestApplication;

  let adminToken: string;
  let studentToken: string;
  let courseId: string;
	let tenantId: string;

  beforeAll(async () => {
    app = await createE2eApp();
		const context = await getTestContext(app);

    adminToken = context.adminToken;
		tenantId = context.adminTenantId;

    // create a course
    const createCourse = await gql(app.getHttpServer(), {
      tenantId,
      token: adminToken,
      query: `mutation { createCourse(input:{ title:"Concurrency Course", description:"test desc" }){ id } }`,
    });
    courseId = createCourse.body.data.createCourse.id;

		// because it has to be unique
		let randomMockEmail = `student-${Math.floor(Math.random() * 10000)}@test.com`;

    // signup a student
    const signup = await gql(app.getHttpServer(), {
      tenantId,
      query: `mutation { signupStudent(input:{ email:"${randomMockEmail}", password:"Minhasenha123!" }){ accessToken } }`,
    });
    studentToken = signup.body.data.signupStudent.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('prevents duplicate enroll under concurrency', async () => {
    const mutation = `
      mutation($input: EnrollInput!) {
        enroll(input: $input) { id courseId userId }
      }
    `;

    const attempts = 5;
    const results = await Promise.allSettled(
      Array.from({ length: attempts }).map(() =>
        gql(app.getHttpServer(), {
          tenantId,
          token: studentToken,
          query: mutation,
          variables: { input: { courseId } },
        }),
      ),
    );

    // count successes and conflicts
    const fulfilled = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value);

    const successCount = fulfilled.filter((r) => !r.body.errors).length;
    const errorCount = fulfilled.filter((r) => r.body.errors).length;

		// 1 successful enrollment
    expect(successCount).toBe(1);

		// all other attempts should have resulted in an error for "Already enrolled"
    expect(errorCount).toBe(attempts - 1);
  });
});