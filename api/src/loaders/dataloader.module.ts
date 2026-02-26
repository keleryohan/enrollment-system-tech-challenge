import { Module } from '@nestjs/common';
import { DataLoaderFactory } from './dataloader.factory';
import { CoursesModule } from '../modules/courses/courses.module';

@Module({
  imports: [CoursesModule],
  providers: [DataLoaderFactory],
  exports: [DataLoaderFactory],
})
export class DataLoaderModule {}