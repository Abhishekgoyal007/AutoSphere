import { getCarFilters } from '@/actions/car-listing';
import React, { Suspense } from 'react'
import { CarFilters } from './_components/cars-filters';
import { CarListings } from './_components/car-listings';
import CarListingsLoading from './_components/car-listing-loading';

export const metadata = {
    title: "Cars | AutoSphere",
    description: "Explore our extensive collection of cars at AutoSphere. Find your perfect vehicle from a wide range of makes and models.",
}

const CarsPage = async () => {
    const filtersData = await getCarFilters();

  return (
    <div className='container mx-auto px-4 py-12'>
        <h1 className='text-6xl mb-4 gradient-title'>Browse Cars</h1>
        <div className='flex flex-col lg:flex-row gap-8'>
            <div className='w-full lg:w-80 flex-shrink-0'>
                {/* Filters */}
                <CarFilters filters={filtersData?.data} />
            </div>
            <div className='flex-1'>
                {/* Listing */}
                <Suspense fallback={<CarListingsLoading />}>
                    <CarListings />
                </Suspense>
            </div>
        </div>
    </div>
  )
}

export default CarsPage