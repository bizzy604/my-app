import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { UserRole, checkPermission } from './roles'

type PermissionType = keyof import('./roles').RolePermissions

export function withRoleAuthorization(
  handler: (req: NextRequest, { params }: { params?: any }) => Promise<NextResponse>,
  requiredPermission?: PermissionType
) {
  return async (req: NextRequest, context: { params?: any }) => {
    const token = await getToken({ req })

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = token.role as UserRole

    if (requiredPermission && !checkPermission(userRole, requiredPermission)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return handler(req, context)
  }
}
