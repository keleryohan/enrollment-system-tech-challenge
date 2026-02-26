import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Course')
export class CourseType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  tenantId!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}