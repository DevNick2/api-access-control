import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { RolesList } from 'src/entities/role.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get(Roles, context.getHandler());

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const userRoles: RolesList[] = user?.roles || []
    const userProfile = user?.profile

    // Verifica se o perfil é permitido
    if (required.profile.length && !required.profile.includes(userProfile)) throw new ForbiddenException()

    // Regra específica para manager
    if (userProfile === "manager" && required.roles?.some((role: RolesList) => [RolesList.CAN_WRITE_COMPANIES, RolesList.CAN_READ_COMPANIES].includes(role))) throw new ForbiddenException()
      
    // Verifica se o usuário possui as permissões
    if (userProfile !== "manager" && required.roles?.length && !required.roles?.every((role: RolesList) => userRoles.includes(role))) throw new ForbiddenException()

    return true
  }
}
