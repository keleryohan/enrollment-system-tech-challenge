import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesResolver } from './courses.resolver';
import { CoursesService } from './courses.service';
import { CourseEntity } from './course.entity';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity]), RedisModule],
  providers: [CoursesService, CoursesResolver],
  exports: [CoursesService],
})
export class CoursesModule {}