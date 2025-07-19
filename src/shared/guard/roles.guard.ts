import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    // Aqui tem que ter o enum da entidade de roles e profile
    const userRoles = user?.roles
    const userProfile = user?.profile

    if (!userRoles) {
      throw new ForbiddenException();
    }

    
    if (userProfile === roles.profile) {
      // enum profile
      // by pass admin
      if (userProfile === "admin") return true

      if (!roles.roles.includes(userRoles)) throw new ForbiddenException()

      return true
    }

    return true
  }
}
