export enum UserRole {
  PROCUREMENT = 'PROCUREMENT',
  VENDOR = 'VENDOR',
  CITIZEN = 'CITIZEN'
}

export interface RolePermissions {
  canCreateTenders: boolean;
  canApplyToTenders: boolean;
  canViewAllTenders: boolean;
  canEditTenders: boolean;
  canDeleteTenders: boolean;
}

export const RolePermissionsMap: Record<UserRole, RolePermissions> = {
  [UserRole.PROCUREMENT]: {
    canCreateTenders: true,
    canApplyToTenders: false,
    canViewAllTenders: true,
    canEditTenders: true,
    canDeleteTenders: true
  },
  [UserRole.VENDOR]: {
    canCreateTenders: false,
    canApplyToTenders: true,
    canViewAllTenders: false,
    canEditTenders: false,
    canDeleteTenders: false
  },
  [UserRole.CITIZEN]: {
    canCreateTenders: false,
    canApplyToTenders: false,
    canViewAllTenders: false,
    canEditTenders: false,
    canDeleteTenders: false
  }
}

export function checkPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return RolePermissionsMap[role][permission]
}
