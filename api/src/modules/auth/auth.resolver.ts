import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth.payload';
import { UserType } from '../users/dto/user.type';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SignupInput } from './dto/signup.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
    @Context('req') req: Request,
  ): Promise<AuthPayload> {
    const tenantId = req.header('x-tenant-id')!;
    const { accessToken, user } = await this.auth.login(tenantId, input.email, input.password);

    return {
      accessToken,
      user: user as UserType,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserType)
  async getUser(@Context('req') req: any): Promise<UserType> {
    return this.auth.getUser(req.user.id) as any;
  }

  @Mutation(() => AuthPayload)
  signupStudent(
    @Args('input') input: SignupInput,
    @Context('req') req: Request,
  ) {
    const tenantId = req.header('x-tenant-id')!;
    return this.auth.signupStudent(tenantId, input.email, input.password);
  }
}
