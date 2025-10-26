"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Predefined options
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];

const AddCarForm = () => {

  const [activeTab, setActiveTab] = useState("ai");

  // Zod schema for form validation
  const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val)=>{
      const year = parseInt(val);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
      );
    }, "Valid year is required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission type is required"),
    bodyType: z.string().min(1, "Body type is required"),
    seats: z.string().optional(),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
    featured: z.boolean().default(false)
  });

  const { 
    register, 
    setValue, 
    getValues, 
    formState: { errors }, 
    handleSubmit,
    watch 
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues:{
      make: '',
      model: '',
      year: '',
      price: '',
      mileage: '',
      color: '',
      fuelType: '',
      transmission: '',
      bodyType: '',
      seats: '',
      description: '',
      status: 'AVAILABLE',
      featured: false,
    },
  });

  const onSubmit = async(data)=>{

  }

  return (
    <div>
      <Tabs defaultValue="ai" className="mt-6" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">AI Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>Enter the details of the car you wanted to add.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='space-y-6'
              >
                {/* Form Fields */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor="make">
                      Make
                    </Label>
                    <Input id='make' {...register('make')} placeholder='e.g. Toyota' className={errors.make ? 'border-red-500' : ''} />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="model">
                      Model
                    </Label>
                    <Input id='model' {...register('model')} placeholder='e.g. Corolla' className={errors.model ? 'border-red-500' : ''} />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="year">
                      Year
                    </Label>
                    <Input id='year' {...register('year')} placeholder='e.g. 2020' className={errors.year ? 'border-red-500' : ''} />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="price">
                      Price ($)
                    </Label>
                    <Input id='price' {...register('price')} placeholder='e.g. 20000' className={errors.price ? 'border-red-500' : ''} />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="mileage">
                      Mileage (km)
                    </Label>
                    <Input id='mileage' {...register('mileage')} placeholder='e.g. 50000' className={errors.mileage ? 'border-red-500' : ''} />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="color">
                      Color
                    </Label>
                    <Input id='color' {...register('color')} placeholder='e.g. Red' className={errors.color ? 'border-red-500' : ''} />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="make">
                      Fuel Type
                    </Label>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai" className="mt-6">Change your password here.</TabsContent>
      </Tabs>
    </div>
  )
}
export default AddCarForm