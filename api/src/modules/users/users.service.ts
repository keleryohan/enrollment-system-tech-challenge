import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
  ) {}
  
  findByEmailInTenant(tenantId: string, email: string) {
    return this.repo.findOne({ where: { tenantId, email } });
  }

  async findUserInTenant(id: string, tenantId: string) {
    const user = await this.repo.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('Usuário não encontrado!');
    return user;
  }

  async createUser(params: {
    tenantId: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    const existing = await this.repo.findOne({ where: { email: params.email } });
    if (existing) throw new ConflictException('Um usuário com esse e-mail já existe!');

    const passwordHash = await bcrypt.hash(params.password, 10);

    const user = this.repo.create({
      tenantId: params.tenantId,
      email: params.email,
      password: passwordHash,
      role: params.role,
    });

    return this.repo.save(user);
  }
}
