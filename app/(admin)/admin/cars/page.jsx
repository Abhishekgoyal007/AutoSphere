import React from 'react'
import CarsList from './_components/car-list'

export const metadata = {
    title: "Cars | AutoSphere Admin",
    description: "Manage cars in the AutoSphere Admin Panel",
}

const CarsPage = () => {
  return (
    <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6'>Cars management</h1>
        <CarsList />
    </div>
  )
}

export default CarsPage