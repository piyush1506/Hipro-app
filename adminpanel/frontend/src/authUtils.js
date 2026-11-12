const AUTH_STORAGE_KEYS = [
  'hipro_auth_token',
  'hipro_user_role',
  'hipro_user_role_display',
  'hipro_permissions',
  'hipro_user',
  'hipro_vendor'
];

const LEGACY_ROLE_STORAGE_KEYS = [
  'hipro_user_role',
  'hipro_user_role_display',
  'hipro_permissions',
  'hipro_user'
];

export function normalizeRoleName(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim().toUpperCase();
  return String(value.name || '').trim().toUpperCase();
}

export function getStaffRoleName(staff) {
  return normalizeRoleName(staff?.role) || normalizeRoleName(staff?.roleName);
}

export function getRoleDisplayName(staff) {
  const role = staff?.role;
  if (role && typeof role === 'object' && role.displayName) {
    return role.displayName;
  }
  return staff?.roleDisplayName || getStaffRoleName(staff);
}

export function getStaffPermissions(staff) {
  const rolePermissions = staff?.role && typeof staff.role === 'object'
    ? staff.role.permissions
    : null;

  if (Array.isArray(rolePermissions)) return rolePermissions;
  if (Array.isArray(staff?.permissions)) return staff.permissions;
  return [];
}

export function isStaffRole(role) {
  const normalized = normalizeRoleName(role);
  return Boolean(normalized && !['VENDOR', 'CUSTOMER', 'USER'].includes(normalized));
}

export function clearLegacyRoleCache() {
  if (typeof window === 'undefined') return;
  LEGACY_ROLE_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
