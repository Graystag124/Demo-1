import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const {
      accessToken,
      pageAccessToken,
      instagramUserId,
      instagramHandle,
      facebookPageId,
      followersCount,
      metaUserId,
      metaUserName,
      metaProfilePicture,
    } = await request.json();

    console.log("[v0] Instagram login API - Received data:", { instagramUserId, instagramHandle, followersCount, metaUserId });

    if (!accessToken || !instagramUserId || !instagramHandle) {
      return NextResponse.json(
        { error: "Missing required Instagram data" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Auth client that will set cookies on the JSON response
    const cookieStore: { name: string; value: string; options: any }[] = [];
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.push({ name, value, options });
            });
          },
        },
      },
    );

    const syntheticEmail = instagramHandle
      ? `${instagramHandle.replace("@", "")}@instagram.collabcart.com`
      : null;

    // First try to find by instagram_business_account_id
    const { data: userByInstagramId } = await adminSupabase
      .from("users")
      .select("*")
      .eq("instagram_business_account_id", instagramUserId)
      .maybeSingle();

    // If not found, try to find by email (synthetic or real)
    const { data: userByEmail } = userByInstagramId ? { data: null } : await adminSupabase
      .from("users")
      .select("*")
      .eq("email", syntheticEmail)
      .maybeSingle();

    const existingUser = userByInstagramId || userByEmail;

    console.log("[v0] Existing user check:", existingUser ? "Found" : "Not found");

    if (existingUser) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          meta_access_token: accessToken,
          meta_page_access_token: pageAccessToken,
          meta_user_id: metaUserId,
          meta_token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          instagram_handle: instagramHandle,
          facebook_page_id: facebookPageId,
          display_name: metaUserName || instagramHandle,
          profile_image_url: metaProfilePicture,
        })
        .eq("id", existingUser.id);

      if (updateError) {
        console.error("[v0] Error updating user:", updateError);
      }

      try {
        const insightsResponse = await fetch(
          `https://graph.facebook.com/v21.0/${instagramUserId}?fields=username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website&access_token=${accessToken}`
        );
        
        if (insightsResponse.ok) {
          const insights = await insightsResponse.json();
          
          // Update user bio if available
          if (insights.biography && !existingUser.bio) {
            await supabase.from("users").update({
              bio: insights.biography,
            }).eq("id", existingUser.id);
          }
          
          await supabase.from("meta_insights").upsert({
            user_id: existingUser.id,
            insight_type: 'account',
            insights_data: insights,
            period_start: new Date().toISOString(),
            period_end: new Date().toISOString(),
          }, { onConflict: 'user_id,insight_type' });
        }
      } catch (error) {
        console.error("[v0] Error updating insights:", error);
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: existingUser.email,
        password: instagramUserId, // Using Instagram ID as password
      });

      if (signInError) {
        console.error("[v0] Error signing in:", signInError);
        return NextResponse.json(
          { error: "Failed to sign in. Please try again." },
          { status: 500 }
        );
      }

      console.log("[v0] User signed in successfully:", signInData.user?.id);

      const response = NextResponse.json({
        success: true,
        email: existingUser.email,
        instagramUserId,
        approvalStatus: existingUser.approval_status,
        userType: existingUser.user_type,
      });

      // Apply auth cookies to the response so middleware can see the session
      cookieStore.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      return response;
    }

    console.log("[v0] User not found, prompting signup");
    return NextResponse.json(
      { error: "No account found. Please sign up first.", shouldSignup: true },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[v0] Instagram login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}