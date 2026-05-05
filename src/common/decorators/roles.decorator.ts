import { SetMetadata } from '@nestjs/common';

export type Roles = 'admin' | 'user' | 'creator';
export const ROLES_KEY = 'roles';

export const Roles = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
