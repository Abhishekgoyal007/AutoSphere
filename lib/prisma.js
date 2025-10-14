import { PrismaClient } from "./generated/prisma";  // ✅ Use custom output path

export const db = globalThis.prisma || new PrismaClient();

if(process.env.NODE_ENV !== "production"){
    globalThis.prisma = db;
}