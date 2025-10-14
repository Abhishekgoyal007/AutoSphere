import { getAdmin } from '@/actions/admin'
import Header from '@/components/header';
import { notFound } from 'next/navigation';
import React from 'react'
import { Sidebar } from './_components/sidebar';  // ✅ Add curly braces

const AdminLayout = async ({children}) => {

    const admin = await getAdmin();
    if(!admin.authorized) {
        return notFound();
    }

    return (
        <div className='min-h-screen'>
            <Header isAdminPage = {true}/>
            <div className='fixed left-0 top-20 z-40 w-56 h-[calc(100vh-80px)]'>
                <Sidebar />
            </div>
            <main className='md:pl-56 pt-20 pb-16 md:pb-0 min-h-[calc(100vh-80px)] bg-gray-50'>{children}</main>
        </div>
    )
}

export default AdminLayout;