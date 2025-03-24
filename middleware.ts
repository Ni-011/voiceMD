import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/sign-in", "/sign-up"];

// Create a matcher for public routes
const isPublicRoute = createRouteMatcher(publicRoutes);

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware(async (auth, req) => {
  // Skip middleware for robots.txt and sitemap.xml
  const url = req.nextUrl.pathname;
  if (url === "/robots.txt" || url === "/sitemap.xml") {
    return NextResponse.next();
  }

  const { userId } = await auth();

  // If the user is signed in and trying to access any public route, redirect to dashboard
  if (userId && isPublicRoute(req)) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If the user is not signed in and trying to access a protected route,
  // redirect them to the sign-in page
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // For all other cases, continue with the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals, robots.txt, sitemap.xml, and all static files, unless found in search params
    "/((?!_next|robots\\.txt|sitemap\\.xml|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
