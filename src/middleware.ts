import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/share/(.*)',
  '/api/webhook',
  '/api/invite'
]);

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes to proceed
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect all other routes - use auth.protect() not auth().protect()
  await auth.protect();
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
