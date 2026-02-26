import request from 'supertest';

export async function gql(
  httpServer: any,
  params: {
    query: string;
    variables?: Record<string, any>;
    tenantId: string;
    token?: string;
  },
) {
  const { query, variables, tenantId, token } = params;

  const headers: Record<string, string> = {
    'X-Tenant-ID': tenantId,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return request(httpServer)
    .post('/graphql')
    .set(headers)
    .send({ query, variables });
}