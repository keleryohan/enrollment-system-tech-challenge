// verifies if the user has the required role to access a route
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
