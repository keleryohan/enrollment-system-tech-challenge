import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantType } from './dto/tenant.type';
import { CreateTenantInput } from './dto/create-tenant.input';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { TenantEntity } from './tenant.entity';
import { RateLimitGuard } from 'src/common/guards/rate-limit.guard';

@Resolver()
export class TenantsResolver {
  constructor(private readonly tenants: TenantsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => TenantType)
  createTenant(@Args('input') input: CreateTenantInput, @Context('req') req: any) {
    const tenantId = req.user.tenantId;

    return this.tenants.createTenant(tenantId, input.name) as Promise<TenantEntity>;
  }
}
