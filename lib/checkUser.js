import { createClient } from './supabase/server';
import { db } from './prisma';

export const checkUser = async()=>{
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if(!user){
        return null;
    }

    try{
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id, // We'll keep the field name for now to avoid schema changes
            }
        });

        if(loggedInUser){
            return loggedInUser;
        }

        const newUser = await db.user.create({
            data:{
                clerkUserId: user.id,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                imageUrl: user.user_metadata?.avatar_url || '',
                email: user.email,
                
            }
        });
        return newUser;
    }catch(error){
        console.log(error.message);
    }
}