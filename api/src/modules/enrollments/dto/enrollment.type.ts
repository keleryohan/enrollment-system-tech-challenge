import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CourseType } from 'src/modules/courses/dto/course.type';

@ObjectType('Enrollment')
export class EnrollmentType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  tenantId!: string;

  @Field(() => ID)
  userId!: string;

	@Field(() => CourseType, { nullable: true })
	course?: CourseType | null;

  @Field(() => ID)
  courseId!: string;

  @Field()
  createdAt!: Date;
}