export const ROLES = {
  ADMIN: 'admin',
  ENGINEER: 'engenheiro',
  OPERATOR: 'operador',
};

export function hasAnyRole(user, roles) {
  return Boolean(user && roles.includes(user.role));
}

export function canManageSystem(user) {
  return hasAnyRole(user, [ROLES.ADMIN]);
}

export function canWriteOperationalData(user) {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.ENGINEER]);
}

export function canChangePartStatus(user) {
  return hasAnyRole(user, [ROLES.ADMIN, ROLES.ENGINEER, ROLES.OPERATOR]);
}
