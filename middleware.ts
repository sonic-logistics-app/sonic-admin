import { NextRequest, NextResponse } from "next/server";
import AdminAuth from "./src/lib/auth/admin-auth";

/**
 * Authentication middleware for admin routes
 * Compliant with design specification
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/api/admin/login", 
    "/api/admin/refresh",
    "/api/admin/status",
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if it's an admin route (all routes except login are admin routes)
  const isAdminRoute = !pathname.startsWith("/login");

  if (isAdminRoute) {
    // For API routes, check JWT token
    if (pathname.startsWith("/api/admin")) {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const token = authHeader.substring(7); // Remove 'Bearer '

      try {
        // In a real implementation, you'd verify the JWT token here
        // For now, we'll just check if it exists
        if (!token) {
          throw new Error("Invalid token");
        }
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    } else {
      // For page routes, check if user is authenticated
      // This would typically be done on the client side with AdminAuth.isAuthenticated()
      // But for middleware, we can check for the presence of cookies/tokens
      const token = request.cookies.get("admin_token")?.value;

      if (!token) {
        // Redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
