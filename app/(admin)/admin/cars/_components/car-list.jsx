"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const CarsList = () => {

    const router = useRouter();

  return (
    <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
            <Button onClick={()=>router.push("/admin/cars/create")}>
                <Plus className="h-4 w-4"/> Add Car
            </Button>

            <form>
                <div>
                    <Search />
                    <Input />
                </div>
            </form>
        </div>

        {/* Cars Table */}
    </div>
  )
}

export default CarsList