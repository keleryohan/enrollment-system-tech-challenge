import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { CoursesService } from '../modules/courses/courses.service';
import { CourseEntity } from '../modules/courses/course.entity';

export type Loaders = {
  courseById: DataLoader<string, CourseEntity | null>;
};

@Injectable()
export class DataLoaderFactory {
  constructor(private readonly courses: CoursesService) {}

	

  create(tenantId: string): Loaders {
    return {
      courseById: new DataLoader<string, CourseEntity | null>(async (ids) => {
        const rows = await this.courses.findByIdsInTenant(tenantId, [...ids]);
        const map = new Map(rows.map((c) => [c.id, c]));

				console.log('[dataloader] courseById batch', { size: ids.length, ids: [...ids] });

        return ids.map((id) => map.get(id) ?? null);
      }),
    };
  }
}