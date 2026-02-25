import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserType } from './dto/user.type';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Resolver()
export class UsersResolver {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@Mutation(() => UserType)
  async createUser(@Args('input') input: CreateUserInput, @Context('req') req: any) {
    const tenantId = req.user.tenantId;

    const user = await this.users.createUser({
      tenantId,
      email: input.email,
      password: input.password,
      role: input.role,
    });

    return user as UserType;
  }
}
