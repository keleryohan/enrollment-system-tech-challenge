import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisRateLimit {
  constructor(private readonly redis: RedisService) {}

  async hit(params: {
    key: string;
    limit: number;
    windowMs: number;
  }): Promise<{ allowed: boolean; remaining: number; resetMs: number }> {
    const now = Date.now();
    const windowStart = now - params.windowMs;

    const zkey = params.key;
    const member = `${now}:${Math.random()}`;

    // atomic-ish using MULTI
    const tx = this.redis.raw.multi(); // this basically queues the commands and runs them atomically (all at once) at the end with exec
    tx.zadd(zkey, now, member);
    tx.zremrangebyscore(zkey, 0, windowStart);
    tx.zcard(zkey);
    tx.pexpire(zkey, params.windowMs * 2); // keep key bounded (in case of low traffic, we still want old keys to expire eventually)
    const res = await tx.exec();

    const count = Number(res?.[2]?.[1] ?? 0);
    const allowed = count <= params.limit;

    return {
      allowed,
      remaining: Math.max(0, params.limit - count),
      resetMs: windowStart + params.windowMs,
    };
  }
}