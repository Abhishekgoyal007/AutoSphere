"use server"

import { serializeCarData } from "@/lib/helper";
// logic for admin related cars page 
// scanning the image with the AI with the Gemini API

import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { file, success } from "zod";

// Function to convert file to base64
async function fileToBase64(file){
    const bytes = await file.arrayBuffer(); // array buffer converts the file to raw bytes like [137, 80, 78, 71, ...]
    const buffer = Buffer.from(bytes);
    return buffer.toString('base64');
}

export async function processCarImageWithAI(file){
    try{
        // Check if API key is available
        if(!process.env.GEMINI_API_KEY){
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Allow overriding the model via env var if the account/endpoint doesn't support the default
    // Default to the newer requested model
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
    const model = genAI.getGenerativeModel({ model: modelName });

        const base64Image = await fileToBase64(file);

        // now will send this base64 to the Gemini API for processing
        const imagePart ={
            inlineData:{
                data: base64Image,
                mimeType: file.type,
            },
        }

        const prompt = `
        Analyze the car image and extract the following information:
        1. Make (manufacturer)
        2. Model 
        3. Year (approximately)
        4. Color
        5. Body Type (SUV, Sedan, Hatchback, etc.)
        6. Mileage
        7. Fuel Type (your best guess)
        8. Transmission type (your best guess)
        9. Price (Your best guess)
        10. Short Description as to be added to a car listing

        Format your response as a clean JSON object with these fields:
        {
            "make": "",
            "model": "",
            "year": 0000,
            "color": "",
            "price": "",
            "mileage": "",
            "bodyType": "",
            "fuelType": "",
            "transmission": "",
            "description": "",
            "confidence": 0.0
        }

        For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
        Only respond with the JSON object, nothing else.
        `;

        const result = await model.generateContent([imagePart, prompt]);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        try{
            const carDetails = JSON.parse(cleanedText);
            
            const requiredFields = ["make", "model", "year", "color", "bodyType", "price", "mileage", "fuelType", "transmission", "description", "confidence"];

            const missingFields = requiredFields.filter(
                (field) => !(field in carDetails)
            );

            if(missingFields.length > 0){
                throw new Error(
                    `AI response missing required fields: ${missingFields.join(", ")}`
                );
            }

            return {
                success: true,
                data: carDetails,
            }
        }catch(error){
            console.error("Error parsing AI response:", error);
            return {
                success: false,
                error: "Failed to parse AI response as JSON",
            };
        }
    }catch(error){
        // Provide a clearer hint when model is not found or not supported for generateContent
        const rawMsg = error?.message || String(error);
        let hint = rawMsg;
        if (/not found/i.test(rawMsg) || /is not found/i.test(rawMsg) || /not supported/i.test(rawMsg)){
            hint = `${rawMsg}. This usually means the chosen model (${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}) is not available for your API version or doesn't support generateContent. Try setting GEMINI_MODEL to a supported model or call ListModels to see available models for your account.`;
        }
        throw new Error("Gemini API error: " + hint);
    }
}


export async function addCar({carData, images}){
    try {
        const authUser = await getAuthUser();
    const userId = authUser?.id;
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {authUserId: userId},
        });

        if (!user) throw new Error("User not found");

        const carId = uuidv4();
        const folderPath = `cars/${carId}`;

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const imageUrls = [];

        for(let i=0; i<images.length; i++){
            const base64Data = images[i];

            // Skip if image data is not valid
            if(!base64Data || !base64Data.startsWith("data:image/")){
                console.warn("Skipping invalid image data");
                continue;
            }

            // Extract the base64 part (remove the data:image/xyz;base64, prefix)
            const base64 = base64Data.split(",")[1];
            const imageBuffer = Buffer.from(base64, "base64");

            // Determine the file extension from the MIME type
            const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
            const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

            // Generate a unique filename
            const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
            const filePath = `${folderPath}/${fileName}`;

            const {data, error} = await supabase.storage.from("car-images").upload(filePath, imageBuffer, {
                contentType: `image/${fileExtension}`,
            });

            if(error) {
                console.error("Error uploading image:", error);
                throw new Error(`Failed to upload image: ${error.message}`);
            }

            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`;

            imageUrls.push(publicUrl);
        }

        if (imageUrls.length === 0){
            throw new Error("No valid images were uploaded");
        }
        const car = await db.car.create({
        data: {
            id: carId, // Use the same ID we used for the folder
            make: carData.make,
            model: carData.model,
            year: carData.year,
            price: carData.price,
            mileage: carData.mileage,
            color: carData.color,
            fuelType: carData.fuelType,
            transmission: carData.transmission,
            bodyType: carData.bodyType,
            seats: carData.seats,
            description: carData.description,
            status: carData.status,
            featured: carData.featured,
            images: imageUrls, // Store the array of image URLs
          },
        })

        revalidatePath("/admin/cars")

        return {
            success: true,
        };
    }catch(error){
        throw new Error("Error adding car:" + error.message);
    }
}

export async function getCars(search = ""){
    try {
        const authUser = await getAuthUser();
    const userId = authUser?.id;
        if(!userId) throw new Error("Unauthorized");
        
        const user = await db.user.findUnique({
            where: {authUserId: userId},
        });

        if(!user) throw new Error("User not found");

        let where = {};

        if(search){
            where.OR = [
                { make: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
                { color: { contains: search, mode: "insensitive" } },
            ]
        }

        const cars = await db.car.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        const serializedCars = cars.map(serializeCarData);

        return {
            success: true,
            data: serializedCars,
        }
    } catch(e){
        console.log("Error fetching cars:", e);
        return {
            success: false,
            error: "Failed to fetch cars",
        }
    }
}

export async function deleteCar(id){
    try{
    const authUser = await getAuthUser();
    const userId = authUser?.id;
    if(!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
        where: {authUserId: userId},
    });

    if(!user) throw new Error("User not found");

    const car = await db.car.findUnique({
        where: {id},
        select: {images: true},
    });

    if(!car){
        return {
            success: false,
            error: "Car not found",
        };
    }

    await db.car.delete({
        where: {id},
    });

    try{
        const cookiesStore = await cookies();
        const supabase = createClient(cookiesStore);

        const filePaths = car.images.map((imageUrl)=>{
            const url = new URL(imageUrl);
            const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
            return pathMatch ? pathMatch[1] : null; // Extract the path after /car-images/
        }).filter(Boolean)

        if(filePaths.length > 0){
            const { error } = await supabase.storage
            .from("car-images").remove(filePaths);
            if(error){
                console.error("Error deleting car images:", error);
            }
        }
    }catch(storageError){  
        console.error("Error deleting car images:", storageError);
    }
    revalidatePath("/admin/cars");
    return {
        success: true,
    };
    }catch(e){
        console.error("Error deleting car:", e);
        return {
            success: false,
            error: "Failed to delete car",
        }
    }
}

export async function updateCarStatus(id, { status, featured }){

    try{
        const authUser = await getAuthUser();
    const userId = authUser?.id;
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {authUserId: userId},
        });

        if(!user) throw new Error("User not found");

        const updateData = {};

        if(status !== undefined){
            updateData.status = status;
        }

        if(featured !== undefined){
            updateData.featured = featured;
        }

        // Update the car 
        await db.car.update({
            where: {id},
            data: updateData,
        });

        revalidatePath("/admin/cars");
        return { success: true  };

    }catch(e){
        console.error("Error updating car status:", e);
        return { success: false, error: "Failed to update car status" };
    }
    
}

