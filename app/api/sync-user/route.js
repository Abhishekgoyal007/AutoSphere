import { checkUser } from '@/lib/checkUser'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await checkUser()
    
    if (user) {
      return NextResponse.json({ 
        success: true, 
        message: 'User synced successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'No authenticated user found' 
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
