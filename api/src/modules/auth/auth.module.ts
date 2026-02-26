import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

function readKey(path: string, label: string) {
  if (!existsSync(path)) {
    throw new Error(
      `${label} file not found at: ${path}. Generate keys into ./keys (jwtRS256.key + jwtRS256.key.pub) or set ${label}_PATH.`,
    );
  }
  return readFileSync(path, 'utf8');
}

const defaultPrivate = join(process.cwd(), 'keys', 'jwtRS256.key');
const defaultPublic = join(process.cwd(), 'keys', 'jwtRS256.key.pub');

const privatePath = process.env.JWT_PRIVATE_KEY_PATH ?? defaultPrivate;
const publicPath = process.env.JWT_PUBLIC_KEY_PATH ?? defaultPublic;

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      privateKey: readKey(privatePath, 'JWT_PRIVATE_KEY'),
      publicKey: readKey(publicPath, 'JWT_PUBLIC_KEY'),
      signOptions: { algorithm: 'RS256', expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
})
export class AuthModule {}