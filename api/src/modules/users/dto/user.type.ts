import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../user.entity';

//<< this line is needed to make the enum available in the GraphQL schema. 
// without this line, we would get an error when trying to use the UserRole enum in the UserType class below.
registerEnumType(UserRole, { name: 'UserRole' }); 

@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  tenantId!: string;

  @Field()
  email!: string;

  @Field(() => UserRole)
  role!: UserRole;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
