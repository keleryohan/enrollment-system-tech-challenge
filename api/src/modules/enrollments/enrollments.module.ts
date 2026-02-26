import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { EnrollmentsResolver } from './enrollments.resolver';
import { EnrollmentsService } from './enrollments.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentEntity]), CoursesModule],
  providers: [EnrollmentsService, EnrollmentsResolver],
})
export class EnrollmentsModule {}