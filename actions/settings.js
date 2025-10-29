import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getDealershipInfo(){
    try{
        const { userId } = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });

        if(!user) throw new Error("User not found");

        // Get the delearship info associated with the user
        let delearship = await db.delearship.findFirst({
            include: {
                workingHours: {
                    orderBy: {
                        dayOfWeek: "asc",
                    }
                }
            }
        })

    }catch(err){

    }
}