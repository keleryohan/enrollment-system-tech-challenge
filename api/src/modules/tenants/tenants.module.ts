import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantEntity } from './tenant.entity';
import { TenantsResolver } from './tenant.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantsService, TenantsResolver],
  exports: [TenantsService],
})
export class TenantsModule {}
