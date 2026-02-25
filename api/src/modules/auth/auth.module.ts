import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      privateKey: readFileSync(process.env.JWT_PRIVATE_KEY_PATH!, 'utf8'),
      publicKey: readFileSync(process.env.JWT_PUBLIC_KEY_PATH!, 'utf8'),
      signOptions: { algorithm: 'RS256', expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
