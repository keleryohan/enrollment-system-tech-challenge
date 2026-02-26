import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RedisLock {
  constructor(private readonly redis: RedisService) {}

  private readonly releaseScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  async acquire(key: string, ttlMs: number): Promise<{ token: string } | null> {
    const token = `${Date.now()}:${Math.random()}`;
    const ok = await this.redis.raw.set(key, token, 'PX', ttlMs, 'NX');
    return ok === 'OK' ? { token } : null;
  }

  async release(key: string, token: string): Promise<boolean> {
    const res = await this.redis.raw.eval(this.releaseScript, 1, key, token);
    return res === 1;
  }

  async withLock<T>(
    key: string,
    ttlMs: number,
    fn: () => Promise<T>,
    opts?: { retries?: number; retryDelayMs?: number },
  ): Promise<T> {
    const retries = opts?.retries ?? 10;
    const retryDelayMs = opts?.retryDelayMs ?? 75;

    for (let i = 0; i <= retries; i++) {
      const acquired = await this.acquire(key, ttlMs);
      if (acquired) {
        try {
          return await fn();
        } finally {
          await this.release(key, acquired.token);
        }
      }
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }

    // If lock couldn’t be acquired, treat as conflict / busy
    throw new Error('Could not acquire lock');
  }
}