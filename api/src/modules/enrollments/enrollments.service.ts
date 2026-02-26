import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { CoursesService } from '../courses/courses.service';
import { RedisLock } from '../../infrastructure/redis/redis.lock';
import { RedisKeys } from '../../infrastructure/redis/redis.keys';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(EnrollmentEntity) private readonly repo: Repository<EnrollmentEntity>,
    private readonly courses: CoursesService,
  	private readonly lock: RedisLock,
  ) {}

  async enroll(tenantId: string, userId: string, courseId: string) {
		const lockKey = RedisKeys.enrollLock(tenantId, userId, courseId);

		try {
			return await this.lock.withLock(
				lockKey,
				5000,
				async () => {
					const course = await this.courses.findByIdInTenant(tenantId, courseId);
					if (!course) throw new NotFoundException('Course not found');

					try {
						const enrollment = this.repo.create({ tenantId, userId, courseId });
						return await this.repo.save(enrollment);
					} catch {
						throw new ConflictException('Already enrolled');
					}
				},
				{ retries: 10, retryDelayMs: 75 },
			);
		} catch (e: any) {
			if (e?.message === 'Could not acquire lock') {
				throw new ConflictException('Enrollment is busy, try again');
			}
			throw e;
		}
	}

	// mostly made to demonstrate batching
	async listByUser(tenantId: string, userId: string) {
  	return this.repo.find({ where: { tenantId, userId }, order: { createdAt: 'DESC' } });
	}
}