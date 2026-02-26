import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error('REDIS_URL is not set');

    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('error', (err) => {
      console.error('[redis] error:', err);
    });
  }

  get raw() { //<< check if needed
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  get(key: string) { //<< check if needed
    return this.client.get(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  set(key: string, value: string, ttlSeconds?: number) {
    if (!ttlSeconds) return this.client.set(key, value);
    return this.client.set(key, value, 'EX', ttlSeconds);
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number) {
    const json = JSON.stringify(value);
    await this.set(key, json, ttlSeconds);
  }

  incr(key: string) {
    return this.client.incr(key);
  }

  // Useful for rate limit
  expire(key: string, ttlSeconds: number) {
    return this.client.expire(key, ttlSeconds);
  }
}