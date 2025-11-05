"use server";
import aj from "@/lib/arcjet";
import { serializeCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

export async function getFeaturedCars(limit = 3) {
    try{
        const cars = await db.car.findMany({
            where: { 
                featured: true, 
                status: "AVAILABLE" 
            },
            take : limit,
            orderBy: {
                createdAt: "desc"
            }
        })

        return cars.map(serializeCarData);
    }catch(err){
        throw new Error("Error fetching featured cars: " + err.message);
    }
}

// Function to convert file to base64
async function fileToBase64(file){
    const bytes = await file.arrayBuffer(); // array buffer converts the file to raw bytes like [137, 80, 78, 71, ...]
    const buffer = Buffer.from(bytes);
    return buffer.toString('base64');
}

export async function processImageSearch(file) {
    try{
        // Rate limiting with Arcjet
        const headersList = await headers();
        
        // Create a request-like object for Arcjet
        const req = {
            ip: headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
            headers: headersList,
        };

        const decision = await aj.protect(req,{
            requested: 1,
        });

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                const { remaining, reset } = decision.reason;

                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset,
                    },
                });

                throw new Error("Rate limit exceeded. Please try again later.");
            }
            throw new Error("Request denied by security policy.");
        }

        // Check if API key is available
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key not configured");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
        const model = genAI.getGenerativeModel({ model: modelName });

        const base64Image = await fileToBase64(file);

        const imagePart ={
            inlineData:{
                data: base64Image,
                mimeType: file.type,
            },
        }

        const prompt = `
            Analyze this car image and extract the following information for a search query:
            1. Make (manufacturer)
            2. Body type (SUV, Sedan, Hatchback, etc.)
            3. Color

            Format your response as a clean JSON object with these fields:
            {
                "make": "",
                "bodyType": "",
                "color": "",
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

            return {
                success: true,
                data: carDetails
            };
        }catch(err){
            console.error("Failed to Parse AI Response:", err, cleanedText);
            return{
                success: false,
                error: "Failed to parse AI response"
            };
        }
    }catch(err){
        throw new Error("Error processing image search: " + err.message);
    }
}