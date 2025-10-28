"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { set, z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

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
  const [uploadingImages, setUploadingImages] = useState([]);
  const [imageError, setImageError] = useState("");

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
    if (uploadingImages.length === 0) {
      setImageError("At least one image is required.");
      return;
    }
  }

  const onMultiImageDrop = (acceptedFiles) => {
    const validFiles = acceptedFiles.filter((files)=>{
      if(files.size > 5 * 1024 * 1024){
        toast.error(`${files.name} is larger than 5MB.`);
        return false;
      }
      return true;  // Keep valid files
    });

    if(validFiles.length === 0) return;

    const newImages = []
    validFiles.forEach((file)=>{  // ✅ Add file parameter
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push(e.target.result);

        if(newImages.length === validFiles.length){
          // All images processed
          // Do something with newImages array
          setUploadingImages((prev) => [...prev, ...newImages]);
          setImageError("");
          toast.success(`${validFiles.length} images uploaded successfully.`);
        }
      };
      reader.readAsDataURL(file);  // ✅ Use file (not files)
    })
  }
  const { 
    getRootProps: getMultiImageRootProps, 
    getInputProps: getMultiImageInputProps, 
    } = useDropzone({
    onDrop: onMultiImageDrop,
    accept:{
      "image/*": [".jpeg", ".png", ".jpg", ".webp"],
    },
    multiple: true,
  })


  const removeImage = (index)=>{
    setUploadingImages((prevImages) => 
      prevImages.filter((_, i) => i !== index)
    );
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
                    <Select 
                      onValueChange={(value) => setValue('fuelType', value)}
                      defaultValue={getValues('fuelType')}
                    >
                      <SelectTrigger className={errors.fuelType ? "border-red-500": ""}>
                      <SelectValue placeholder="Select Fuel Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((types)=>{
                          return(
                            <SelectItem key={types} value={types}>
                              {types}
                            </SelectItem>
                          )})}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="transmission">
                      Transmission
                    </Label>
                    <Select 
                      onValueChange={(value) => setValue('transmission', value)}
                      defaultValue={getValues('transmission')}
                    >
                      <SelectTrigger className={errors.transmission ? "border-red-500": ""}>
                      <SelectValue placeholder="Select Transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((types)=>{
                          return(
                            <SelectItem key={types} value={types}>
                              {types}
                            </SelectItem>
                          )})}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="bodyType">
                      Body Type
                    </Label>
                    <Select 
                      onValueChange={(value) => setValue('bodyType', value)}
                      defaultValue={getValues('bodyType')}
                    >
                      <SelectTrigger className={errors.bodyType ? "border-red-500": ""}>
                      <SelectValue placeholder="Select Body Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((types)=>{
                          return(
                            <SelectItem key={types} value={types}>
                              {types}
                            </SelectItem>
                          )})}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="seats">
                      Number of Seats{" "}
                      <span className='text-sm text-gray-500'>(Optional)</span>
                    </Label>
                    <Input 
                      id="seats"
                      type="number"
                      {...register('seats')}
                      placeholder="e.g. 5"
                      className={errors.seats ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor="status">
                      Status
                    </Label>
                    <Select 
                      onValueChange={(value) => setValue('status', value)}
                      defaultValue={getValues('status')}
                    >
                      <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatuses.map((status)=> (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description - Full Width Below */}
                <div className='space-y-2'>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    {...register('description')}
                    placeholder="Enter detailed description of the car..."
                    className={`min-h-32 ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.description && (
                    <p className='text-xs text-red-500'>
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <div className='flex items-start space-x-3 space-y-0 rounded-md border p-4'>
                  <Checkbox 
                    id="featured"
                    checked={watch('featured')}
                    onCheckedChange={(checked)=>{
                      setValue('featured', checked);
                    }}
                  />
                  <div className='space-y-1 leading-none'>
                    <Label htmlFor="featured">Feature this car</Label>
                    <p className='text-sm text-gray-500'>
                      Featured cars appear on the homepage
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="images" className={imageError ? "text-red-500":""}>Images{" "}{imageError && <span className='text-red-500'>*</span>}</Label>
                  <div {...getMultiImageRootProps()} className={`border-dashed border-2 hover:bg-gray-50 transition border-gray-300 p-6 text-center rounded-lg cursor-pointer mt-2 ${imageError ? "border-red-500": "border-gray-300"}`}>
                    <input {...getMultiImageInputProps()} />
                    <div className='flex flex-col items-center justify-center'>  
                    <Upload className='h-12 w-12 text-gray-400 mb-3'/>
                      <p className='text-gray-600 text-sm mb-2'>
                        Drag and drop or click to upload multiple images 
                      </p>
                      <p className='text-gray-500 text-xs mt-1'>
                        (JPG, PNG, webP, max 5MB each)
                      </p>
                    </div>
                  </div>
                  {imageError && (
                    <p className='text-xs text-red-500'>{imageError} </p>
                  )}
                </div>

                {uploadingImages.length > 0 && (
                  <div className='mt-4'>
                    <h3 className='text-sm font-medium mb-2'>Uploaded Images ({uploadingImages.length})</h3>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                      {uploadingImages.map((img, index)=>{
                        return (
                          <div key={index} className="relative group">
                            <Image 
                              src={img}
                              alt={`Uploaded car image ${index + 1}`}
                              height={100}
                              width={100}
                              className="object-cover rounded-md mr-2 mb-2"
                              priority
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={()=> removeImage(index)}
                            ><X className='h-3 w-3' /></Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
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