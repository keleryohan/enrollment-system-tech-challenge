import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  // rename to avoid getter name conflicts later
  private readonly redisClient: Redis;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error('REDIS_URL is not set');

    this.redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.redisClient.on('error', (err) => {
      console.error('[redis] error:', err);
    });
  }

  get raw(): Redis {
    return this.redisClient;
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  get(key: string) {
    return this.redisClient.get(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const v = await this.redisClient.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  set(key: string, value: string, ttlSeconds?: number) {
    if (!ttlSeconds) return this.redisClient.set(key, value);
    return this.redisClient.set(key, value, 'EX', ttlSeconds);
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number) {
    const json = JSON.stringify(value);
    await this.set(key, json, ttlSeconds);
  }

  incr(key: string) {
    return this.redisClient.incr(key);
  }

  expire(key: string, ttlSeconds: number) {
    return this.redisClient.expire(key, ttlSeconds);
  }

  // reset the database for tests
  async flushDb(): Promise<'OK'> {
    return this.redisClient.flushdb();
  }
}