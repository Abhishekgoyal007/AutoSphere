"use client"

import React, { useCallback, useState } from 'react'
import { Input } from './ui/input'
import { Camera, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const HomeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isImageSearchActive, setIsImageSearchActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false); 

  const router = useRouter();

  const handleTextSubmit = async (e)=>{
    e.preventDefault();
    if(!searchTerm.trim()){
      toast.error("Please enter a search term");
      return;
    }
    router.push(`/cars?search=${encodeURIComponent(searchTerm)}`)
  };
  const handleImageSearch = async (e)=>{
    e.preventDefault();
    if(!searchImage){
      toast.error("Please upload an image first")
      return;
    }

    // add ai logic 

  }

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];

    if(file){
      if(file.size > 5 * 1024 * 1024){
        toast.error("File size exceeds 5MB limit");
        return;
      }

      setIsUploading(true);
      setSearchImage(file);

      const reader = new FileReader();
      reader.onloadend = ()=>{
        setImagePreview(reader.result);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };

      reader.onerror = ()=>{
        setIsUploading(false);
        toast.error("Failed to read file");
      };

      reader.readAsDataURL(file);
    }
  }
  const {getRootProps, getInputProps, isDragActive, isDragReject} = useDropzone({
    onDrop,
    accept:{
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    maxFiles: 1,
  })

  return (
    <div>
      <form onSubmit={handleTextSubmit}>
        <div className='relative flex items-center'>
          <Input 
            type="text"
            placeholder='Search by make, model, year, keyword or use our AI Image search...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"
          />
          <div className='absolute right-[100px]'>
            <Camera  
              size={35}
              onClick={()=>setIsImageSearchActive(!isImageSearchActive)}
              className='cursor-pointer rounded-xl p-1.5'
              style={{
                background: isImageSearchActive ? "black" : "",
                color: isImageSearchActive ? "white" : "",
              }}
            />
          </div>
          <Button type="submit" className="absolute right-2 rounded-full">
              Search
          </Button>
        </div>
      </form>
      {isImageSearchActive && <div>
        <form onSubmit={handleImageSearch}>
          <div className='border-2 border-dashed border-gray-300 rounded-3xl p-6 mt-6 text-center'>
            {imagePreview ? (
              <div className='flex flex-col items-center'>
                <img 
                  src={imagePreview}
                  alt='Car Preview'
                  className='h-40 object-contain mb-4'
                />
                <Button
                  variant="outline"
                  onClick={()=>{
                    setSearchImage(null);
                    setImagePreview("");
                    toast.info("Image removed");
                  }}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div {...getRootProps()} className='cursor-pointer'>
                <input {...getInputProps()} />
                <div className='flex flex-col items-center'>
                  <Upload size={50} className='mx-auto mb-2'/>
                  <p className='text-gray-500 mb-2'>
                    {isDragActive && !isDragReject 
                      ? "Leave the files here to upload" 
                      : "Drag and drop an image here, or click to select files"}
                  </p>
                  {isDragReject && (
                    <p className='text-red-500 mb-2'>Invalid Image Type</p>
                  )}
                  <p className='text-gray-400 text-sm'>
                    Supports: JPG, PNG (max 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>
          {imagePreview && (
            <Button 
              type="submit"
              className="w-full mt-2"
              disabled={isUploading}>
              {isUploading ? "Uploading...":"Search with this Image"}
            </Button>
          )}
        </form>
      </div>}
    </div>
  )
}

export default HomeSearch