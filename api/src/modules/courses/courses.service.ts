import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CourseEntity } from './course.entity';
import { decodeCursor, encodeCursor } from 'src/common/utils/cursor';
import { CourseConnectionType } from './dto/course-connection.type';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RedisKeys } from '../../infrastructure/redis/redis.keys';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity) private readonly repo: Repository<CourseEntity>,
  	private readonly redis: RedisService,
  ) {}

  async create(tenantId: string, data: { title: string; description?: string }) {
		const course = this.repo.create({
			tenantId,
			title: data.title,
			description: data.description ?? null,
		});

		console.log('[courses] create called', { tenantId }); //<< remove
		await this.redis.incr(`debug:incr`);
		console.log('debug incr ok');

		const saved = await this.repo.save(course);

		await this.bumpCatalogVersion(tenantId);

		return saved;
	}

  async update(tenantId: string, data: { id: string; title?: string; description?: string }) {
		const course = await this.repo.findOne({ where: { id: data.id, tenantId } });
		if (!course) throw new NotFoundException('Course not found');

		if (data.title !== undefined) course.title = data.title;
		if (data.description !== undefined) course.description = data.description;

		const saved = await this.repo.save(course);

		await this.bumpCatalogVersion(tenantId);
		return saved;
	}

  async findByIdInTenant(tenantId: string, id: string) {
    return this.repo.findOne({ where: { id, tenantId } });
  }

	private convertDateFromNode(conn: any) { //<< better way to do it? 
		return {
			...conn,
			edges: (conn.edges ?? []).map((e: any) => ({
				...e,
				node: {
					...e.node,
					createdAt: e.node?.createdAt ? new Date(e.node.createdAt) : null,
					updatedAt: e.node?.updatedAt ? new Date(e.node.updatedAt) : null,
				},
			})),
		};
	}

  async catalog(tenantId: string, args: { first: number; after?: string }): Promise<CourseConnectionType> {
		const first = Math.min(Math.max(args.first, 1), 50);

		const version = await this.getCatalogVersion(tenantId);
		const cacheKey = RedisKeys.catalogPage({
			tenantId,
			version,
			first,
			after: args.after ?? null,
		});

		// first we try redis
		try {
			const cached = await this.redis.getJson<CourseConnectionType>(cacheKey);
			if (cached) return this.convertDateFromNode(cached) as CourseConnectionType;
		} catch (e) {
			console.error('[catalog] cache read failed', e);
		}

		// not on redis -> query from db
		const qb = this.repo
			.createQueryBuilder('course')
			.where('course.tenantId = :tenantId', { tenantId })
			.orderBy('course.createdAt', 'DESC')
			.addOrderBy('course.id', 'DESC')
			.take(first + 1);

		if (args.after) {
			const { createdAt, id } = decodeCursor(args.after);
			qb.andWhere(
				'(course.createdAt < :createdAt OR (course.createdAt = :createdAt AND course.id < :id))',
				{ createdAt: new Date(createdAt), id },
			);
		}

		const rows = await qb.getMany();
		const hasNextPage = rows.length > first;
		const pageItems = rows.slice(0, first);

		const edges = pageItems.map((c) => ({
			node: c as any,
			cursor: encodeCursor({ createdAt: c.createdAt.toISOString(), id: c.id }),
		}));

		const result: CourseConnectionType = {
			edges,
			pageInfo: {
				hasNextPage,
				endCursor: edges.length ? edges[edges.length - 1].cursor : '',
			},
		};

		// not on redis -> write to redis for next time
		try {
			await this.redis.setJson(cacheKey, result, 60);
		} catch (e) {
			console.error('[catalog] cache write failed', e);
		}

		return result;
	}

	private async getCatalogVersion(tenantId: string): Promise<number> {
		const key = RedisKeys.catalogVersion(tenantId);
		try {
			const v = await this.redis.get(key);
			if (!v) return 1;
			const n = Number(v);
			return Number.isFinite(n) && n > 0 ? n : 1;
		} catch {
			return 1;
		}
	}

	private async bumpCatalogVersion(tenantId: string): Promise<void> {
		try {
			await this.redis.incr(RedisKeys.catalogVersion(tenantId));
		} catch (e) {
			console.error('[catalog] version bump failed', e);
		}
	}

	async findByIdsInTenant(tenantId: string, ids: string[]) {
		if (ids.length === 0) return [];
		return this.repo.find({
			where: { tenantId, id: In(ids) },
		});
	}

}