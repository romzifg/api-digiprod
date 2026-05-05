import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles, ROLES_KEY } from 'src/common/decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(
    context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!required || required.length == 0) return true

    const req = context.switchToHttp().getRequest();
    const user = req.user as { role?: Roles }

    if (!user || !user.role) {
      throw new ForbiddenException({
        message: 'user is not login',
        errors: 'user is not login'
      })
    }

    if (!required.includes(user.role)) {
      throw new ForbiddenException({
        message: 'user is not authorized',
        errors: `role is required, ${required.join(', ')}`
      })
    }

    return true
  }
}
