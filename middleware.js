import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';


// protecting the private routes
const isProtectedRoute = createRouteMatcher([
    "/admin(.*)",
    "/saved-cars(.*)",
    "/reservations(.*)",
])

export default clerkMiddleware(async (auth, req)=>{
    const authResult = await auth();
    const {userId} = authResult;
    
    if(!userId && isProtectedRoute(req)){
        return authResult.redirectToSignIn();
    }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};