import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsResolver } from './enrollments.resolver';

@Module({
  providers: [EnrollmentsService, EnrollmentsResolver]
})
export class EnrollmentsModule {}
