import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Tenant')
export class TenantType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
