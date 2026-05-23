import type { AppRole } from '../types/api';

export const ROLES = {
  ADMIN: 'admin',
  ENGINEER: 'engenheiro',
  OPERATOR: 'operador',
} as const satisfies Record<string, AppRole>;

type RoleAwareUser = {
  role?: AppRole | string | null;
} | null | undefined;

export function hasAnyRole(user: RoleAwareUser, roles: AppRole[]): boolean {
  return Boolean(user?.role && roles.includes(user.role as AppRole));
}

export function canManageSystem(user: RoleAwareUser): boolean {
  return hasAnyRole(user, [ROLES.ADMIN]);
}

export function canWriteOperationalData(user: RoleAwareUser): boolean {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.ENGINEER]);
}

export function canChangePartStatus(user: RoleAwareUser): boolean {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.ENGINEER, ROLES.OPERATOR]);
}
