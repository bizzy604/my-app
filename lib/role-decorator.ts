import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthSession } from './auth'
import { Role } from '@prisma/client'

export async function withAuth(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  allowedRoles?: Role[]
) {
  return async (req: NextRequest, context: any) => {
    const session = await getServerAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return handler(req, context)
  }
}
