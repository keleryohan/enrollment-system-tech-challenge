import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { UserRole } from '../users/user.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantsRepo: Repository<TenantEntity>,
  ) {}

  async findByIdOrThrow(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantsRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findByName(name: string): Promise<TenantEntity | null> {
    return this.tenantsRepo.findOne({ where: { name } });
  }

  // rule: only users with ADMIN role from the "admin" tenant can create new tenants
  async createTenant(tenantId: string, name: string): Promise<TenantEntity> {
    // check actor tenant is the platform/admin tenant
    const actorTenant = await this.findByIdOrThrow(tenantId);
    if (actorTenant.name !== 'admin') {
      throw new ForbiddenException('Apenas usuários com função ADMIN do tenant "admin" podem criar novos tenants');
    }

    const existing = await this.tenantsRepo.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('Um tenant com esse nome já existe');
    }

    const tenant = this.tenantsRepo.create({ name });
    return this.tenantsRepo.save(tenant);
  }
}
