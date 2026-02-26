import { Field, ObjectType } from '@nestjs/graphql';
import { CourseEdgeType } from './course-edge.type';
import { PageInfoType } from './page-info.type';

@ObjectType()
export class CourseConnectionType {
  @Field(() => [CourseEdgeType])
  edges!: CourseEdgeType[]; // wrapper for the actual data

  @Field(() => PageInfoType)
  pageInfo!: PageInfoType; // information about the current page. like hasNextPage, hasPreviousPage, startCursor, endCursor
}