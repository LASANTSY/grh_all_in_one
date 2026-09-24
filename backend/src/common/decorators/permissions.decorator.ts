import { SetMetadata } from '@nestjs/common';
import { TypeCompte } from '../enums/type-compte.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: TypeCompte[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);