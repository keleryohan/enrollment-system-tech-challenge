import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisLock } from './redis.lock';
import { RedisRateLimit } from './redis.rate-limit';

@Global() // dont need to import in every other module
@Module({
  providers: [RedisService, RedisLock, RedisRateLimit],
  exports: [RedisService, RedisLock, RedisRateLimit],
})
export class RedisModule {}