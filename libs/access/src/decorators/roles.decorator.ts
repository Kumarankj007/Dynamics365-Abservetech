import { createParamDecorator, SetMetadata, ExecutionContext } from '@nestjs/common';
import { Role } from 'libs/access/src/enums/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export interface JwtUser {
  userId: string;
  email: string;
  roles: Role[];
  currentRole: Role;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
