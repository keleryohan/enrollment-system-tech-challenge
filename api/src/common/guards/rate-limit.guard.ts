import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { RedisRateLimit } from '../../infrastructure/redis/redis.rate-limit';
import { RedisKeys } from '../../infrastructure/redis/redis.keys';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rate: RedisRateLimit) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gql = GqlExecutionContext.create(context);
    const ctx = gql.getContext<{ req: any }>();
    const req = ctx.req;

		// if there is no user/he isnt autenticated, we cant really measure the limit so just let the jwt guard deal with it
    const user = req?.user;
    if (!user?.id || !user?.tenantId) return true;

		// only need to apply it to mutations, since queries dont change the state
    const info = gql.getInfo();
    if (info?.operation?.operation !== 'mutation') return true;

    const key = RedisKeys.mutationRate(user.tenantId, user.id);
    const { allowed } = await this.rate.hit({
      key,
      limit: 20,
      windowMs: 60_000,
    });

    if (!allowed) {
      throw new GraphQLError('Um máximo de 20 mutações por minuto é permitido!!', {
        extensions: {
          code: 'TOO_MANY_REQUESTS',
          http: { status: 429 },
        },
      });
    }

    return true;
  }
}