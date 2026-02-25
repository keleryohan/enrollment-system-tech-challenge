import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { readFileSync } from 'fs';
import { Request } from 'express';

type JwtPayload = {
  sub: string;
  tenantId: string;
  role: 'ADMIN' | 'STUDENT';
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: readFileSync(process.env.JWT_PUBLIC_KEY_PATH!, 'utf8'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const headerTenantId = req.header('x-tenant-id');
    if (!headerTenantId) throw new UnauthorizedException('X-Tenant-ID header é obrigatório');
    if (headerTenantId !== payload.tenantId) throw new UnauthorizedException('Tenant ID do token não corresponde ao Tenant ID do header');

    return payload;
  }
}
