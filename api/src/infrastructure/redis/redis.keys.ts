export const RedisKeys = {
  catalogVersion: (tenantId: string) => `tenant:${tenantId}:catalog:version`,

  catalogPage: (params: {
    tenantId: string;
    version: number;
    first: number;
    after?: string | null;
  }) => {
    const after = params.after ?? 'none';
    return `tenant:${params.tenantId}:catalog:v${params.version}:first:${params.first}:after:${after}`;
  },

  enrollLock: (tenantId: string, userId: string, courseId: string) =>
    `tenant:${tenantId}:enroll:${userId}:${courseId}:lock`,

  mutationRate: (tenantId: string, userId: string) =>
    `tenant:${tenantId}:user:${userId}:mutations`,
} as const;