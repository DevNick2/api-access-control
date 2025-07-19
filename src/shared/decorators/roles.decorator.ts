import { Reflector } from '@nestjs/core';

type RolesObject = { profile: string, roles: string[] }

export const Roles = Reflector.createDecorator<RolesObject>();