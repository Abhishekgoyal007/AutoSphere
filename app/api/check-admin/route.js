import { getAuthUser } from '@/lib/auth'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json({ isAdmin: false })
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { authUserId: authUser.id },
      select: { role: true }
    })

    return NextResponse.json({ 
      isAdmin: user?.role === 'ADMIN'
    })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
