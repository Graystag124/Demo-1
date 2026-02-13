import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Middleware - Path:", request.nextUrl.pathname, "User:", user?.id ? "Present" : "None");

  if (
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/privacy") ||
    request.nextUrl.pathname.startsWith("/termsandconditions")
  ) {
    console.log("[v0] Middleware - Public route, allowing access");
    return supabaseResponse;
  }

  if (!user) {
    console.log("[v0] Middleware - No user, redirecting to login");
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  const { data: userData } = await supabase
    .from("users")
    .select("approval_status, user_type")
    .eq("id", user.id)
    .single();

  console.log("[v0] Middleware - User data:", userData);

  // Allow all logged-in users to access admin dashboard
  if (request.nextUrl.pathname.startsWith("/admin")) {
    console.log("[v0] Middleware - Allowing access to admin dashboard");
    return supabaseResponse;
  }

  if (userData?.approval_status === "pending") {
    console.log("[v0] Middleware - User pending approval");
    if (request.nextUrl.pathname !== "/auth/pending-approval") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/pending-approval";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (userData?.approval_status === "rejected") {
    console.log("[v0] Middleware - User rejected");
    if (request.nextUrl.pathname !== "/auth/rejected") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/rejected";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (userData?.approval_status === "approved") {
    console.log("[v0] Middleware - User approved, allowing access");
    return supabaseResponse;
  }

  console.log("[v0] Middleware - No approval status, redirecting to pending");
  const url = request.nextUrl.clone();
  url.pathname = "/auth/pending-approval";
  return NextResponse.redirect(url);
}
