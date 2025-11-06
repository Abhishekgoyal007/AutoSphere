'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { ArrowLeft, CarFront, Heart, Layout, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = ({isAdminPage=false}) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Check if user is admin (you'll need to add this logic based on your needs)
      // For now, checking if email matches or if there's a user_metadata field
      if (user?.user_metadata?.role === 'ADMIN' || user?.email === 'your-admin-email@example.com') {
        setIsAdmin(true)
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (<header className='fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b'>
    <nav className='mx-auto px-4 py-4 flex items-center justify-between'>
      <Link href={isAdminPage ? '/admin':'/'} className='flex'>
        <Image 
          src={'/Logo.png'} 
          alt='Autosphere Logo'
          width={100}
          height={50}
          className='h-12 w-auto object-contain' 
        />
        {
          isAdminPage && (
            <span className='text-xs font-extralight'>Admin</span>
          )
        }
      </Link>
      <div className='flex items-center gap-4'>
        {isAdminPage ? (
          <Link href='/'>
            <Button variant='outline' className='flex items-center gap-2'>
              <ArrowLeft size={18}/>
              <span className='hidden md:inline'>Back to App</span>
            </Button>
          </Link>
          ):(
          user && (
            <>
              <Link href='/saved-cars'>
                <Button>
                  <Heart size={18}/>
                  <span className='hidden md:inline'>Saved Cars</span>
                </Button>
              </Link>

              {!isAdmin ? (<Link href='/reservations'>
                <Button variant='outline'>
                  <CarFront size={18}/>
                  <span className='hidden md:inline'>My Reservations</span>
                </Button>
              </Link>):

              (<Link href='/admin'>
                <Button variant='outline'>
                  <Layout size={18}/>
                  <span className='hidden md:inline'>Admin Portal</span>
                </Button>
              </Link>)}
            </>
          )
        )}

        {!user && !loading && (
          <Link href='/sign-in'>
            <Button variant='outline'>
              Login
            </Button>
          </Link>
        )}
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  </header>
  );
}

export default Header