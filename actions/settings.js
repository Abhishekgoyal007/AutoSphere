"use server";

import { db } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getDealershipInfo(){
    try{
        const authUser = await getAuthUser();
    const userId = authUser?.id;
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {authUserId: userId},
        });

        if(!user) throw new Error("User not found");

        // Get the dealership info
        let dealership = await db.dealershipInfo.findFirst({
            include: {
                workingHours: {
                    orderBy: {
                        dayOfWeek: "asc",
                    }
                }
            }
        });

        if(!dealership){
            dealership = await db.dealershipInfo.create({
                data: {
                    // Default values will be used from schema
                    workingHours: {
                        create: [
                            { dayOfWeek: "MONDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
                            { dayOfWeek: "TUESDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
                            { dayOfWeek: "WEDNESDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
                            { dayOfWeek: "THURSDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
                            { dayOfWeek: "FRIDAY", openTime: "09:00", closeTime: "18:00", isOpen: true },
                            { dayOfWeek: "SATURDAY", openTime: "10:00", closeTime: "16:00", isOpen: true },
                            { dayOfWeek: "SUNDAY", openTime: "10:00", closeTime: "16:00", isOpen: false },
                        ],
                    },
                },
                include: { workingHours: { orderBy: { dayOfWeek: "asc" } } },
            });
        }

        // Return the dealership info to the caller
        return {
            success: true,
            data: {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),
            },
        };
    }catch(err){
        throw new Error("Error fetching dealership info: " + err.message);
    }
}

export async function saveWorkingHours(workingHours) {
    try{
        const authUser = await getAuthUser();
        const userId = authUser?.id;
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {authUserId: userId},
        });

        if(!user || user.role !== "ADMIN"){
            throw new Error("Unauthorized: Admin access required");
        }

        const dealership = await db.dealershipInfo.findFirst();

        if(!dealership){
            throw new Error("Dealership info not found");
        }

        // Delete existing working hours for this dealership
        await db.workingHours.deleteMany({
            where: { dealerShipId: dealership.id },
        });

        // Then create new hours
        for (const hour of workingHours) {
            await db.workingHours.create({
                data: {
                    dayOfWeek: hour.dayOfWeek,
                    openTime: hour.openTime,
                    closeTime: hour.closeTime,
                    isOpen: hour.isOpen,
                    dealerShipId: dealership.id,
                },
            });
        }

        revalidatePath('/admin/settings');
        revalidatePath('/');

        return {
            success: true,
        }
    }catch(err){
        throw new Error("Error saving working hours: " + err.message);
    }
}

export async function getUsers() {
    try{
        const authUser = await getAuthUser();
        const userId = authUser?.id;
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {authUserId: userId},
        });

        if(!user || user.role !== "ADMIN"){
            throw new Error("Unauthorized: Admin access required");
        }

        // Get all the users
        const users = await db.user.findMany({
            orderBy:{
                createdAt: "desc",
            },
        })

        return {
            success: true,
            data: users.map((u)=>({
                ...u,
                createdAt: u.createdAt.toISOString(),
                updatedAt: u.updatedAt.toISOString(),
            }))
        }
    }catch(err){
        throw new Error("Error fetching users: " + err.message);
    }
}

export async function updateUserRole(authUserId, role) {
    try{
        const authUser = await getAuthUser();
        const adminId = authUser?.id;
        if(!adminId) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where: {authUserId: adminId},
        });
        if(!user || user.role !== "ADMIN"){
            throw new Error("Unauthorized: Admin access required");
        }
        // Update the target user's role by their authUserId
        const updated = await db.user.update({
            where: { authUserId },
            data: { role },
        });
        revalidatePath('/admin/settings');
        return {
            success: true,
        }
    }catch(err){
        throw new Error("Error updating user role: " + err.message);
    }
}

