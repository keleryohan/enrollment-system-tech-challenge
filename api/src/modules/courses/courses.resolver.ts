import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseType } from './dto/course.type';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CatalogArgs } from './dto/catalog.args';
import { CourseConnectionType } from './dto/course-connection.type';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';

@Resolver()
export class CoursesResolver {
  constructor(private readonly courses: CoursesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => CourseType)
  createCourse(@Args('input') input: CreateCourseInput, @Context('req') req: any) {
    const tenantId = req.user.tenantId;
    return this.courses.create(tenantId, input) as any;
  }

  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => CourseType)
  updateCourse(@Args('input') input: UpdateCourseInput, @Context('req') req: any) {
    const tenantId = req.user.tenantId;
    return this.courses.update(tenantId, input) as any;
  }

	@UseGuards(JwtAuthGuard)
	@Query(() => CourseConnectionType)
	catalog(@Args() args: CatalogArgs, @Context('req') req: any) {
		return this.courses.catalog(req.user.tenantId, args) as any;
	}
}