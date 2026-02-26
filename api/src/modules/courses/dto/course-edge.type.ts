import { Field, ObjectType } from '@nestjs/graphql';
import { CourseType } from './course.type';

@ObjectType()
export class CourseEdgeType {
  @Field()
  cursor!: string; // where to start the page. its usually a stactic field like createdAt or id. needs to be unique and orderable

  @Field(() => CourseType)
  node!: CourseType; // the actual data
}