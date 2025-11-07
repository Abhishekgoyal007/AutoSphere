'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignInPage() {
  const supabase = createClient()
  const router = useRouter()
  const [redirectUrl, setRedirectUrl] = useState('')

  useEffect(() => {
    // Set redirect URL on client side only
    setRedirectUrl(`${window.location.origin}/auth/callback`)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/')
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Sign In to AutoSphere</h1>
          {redirectUrl && (
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              redirectTo={redirectUrl}
              view="sign_in"
              showLinks={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}
