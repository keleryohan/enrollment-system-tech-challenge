import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentType } from './dto/enrollment.type';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { Field, ID, InputType } from '@nestjs/graphql';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';
import { CourseType } from '../courses/dto/course.type';

@InputType()
class EnrollInput {
  @Field(() => ID)
  courseId!: string;
}

@Resolver(() => EnrollmentType)
export class EnrollmentsResolver {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles(UserRole.STUDENT)
  @Mutation(() => EnrollmentType)
  enroll(@Args('input') input: EnrollInput, @Context('req') req: any) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return this.enrollments.enroll(tenantId, userId, input.courseId) as any;
  }

	@ResolveField(() => CourseType, { nullable: true })
  course(@Parent() enrollment: any, @Context() ctx: any) {
    return ctx.loaders.courseById.load(enrollment.courseId);
  }

	@UseGuards(JwtAuthGuard)
	@Query(() => [EnrollmentType])
	myEnrollments(@Context('req') req: any) {
		return this.enrollments.listByUser(req.user.tenantId, req.user.sub);
	}
}