import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class FlatIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // Super Admin bypasses flat isolation
    if (user.role === Role.SUPER_ADMIN) return true;

    const tenantFlatId = request.tenantFlatId;

    // If no tenant context and user is not super admin, deny
    if (!tenantFlatId) {
      throw new ForbiddenException('No tenant context');
    }

    // User must belong to the current tenant
    if (user.flatId !== tenantFlatId) {
      throw new ForbiddenException('Access denied: you do not belong to this apartment');
    }

    return true;
  }
}
