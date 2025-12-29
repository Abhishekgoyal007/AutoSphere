import { PrismaClient } from "./generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

// Optimized Prisma client for serverless (Vercel) with Accelerate
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    }).$extends(withAccelerate());
};

// Use global variable to prevent multiple instances in development
const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}