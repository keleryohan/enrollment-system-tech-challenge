import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserEntity, UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(tenantId: string, email: string, password: string) {

    const user = await this.users.findByEmail(email);
    if (!user || user.tenantId !== tenantId) {
      throw new UnauthorizedException('Dados de login inválidos!');
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) throw new UnauthorizedException('Dados de login inválidos!');
    const accessToken = await this.jwt.signAsync({
      id: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    return { accessToken, user };
  }

  async getUserInTenant(userId: string, tenantId: string): Promise<UserEntity> {
    return this.users.findUserInTenant(userId, tenantId);
  }

  async signupStudent(tenantId: string, email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.users.createUser({
      tenantId,
      email,
      password,
      role: UserRole.STUDENT,
    });

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    return { accessToken, user };
  }
}
