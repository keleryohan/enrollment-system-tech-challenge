import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from '../user.entity';

@InputType()
export class CreateUserInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field(() => UserRole)
  role!: UserRole;
}
