import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Destructure ALL fields sent from the frontend
    const {
      // Auth & Meta Data
      accessToken,
      pageAccessToken,
      instagramUserId,
      instagramHandle,
      facebookPageId,
      followersCount,
      userType,
      metaUserId,
      metaUserName,
      metaProfilePicture,
      email, // Get email from form data

      // New Profile Data (Critical for saving "half the info")
      phone,
      country,
      state,
      city,
      website,
      niche,
      content_style,
      languages,
      business_type,
      business_description,
    } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    console.log("[v0] Instagram signup - Payload Received:", { 
      instagramHandle, 
      userType, 
      phone, 
      niche, 
      business_type 
    });

    if (!accessToken || !instagramUserId || !instagramHandle) {
      return NextResponse.json(
        { error: "Missing required Instagram data" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    // 2. Check if user exists with this email or Instagram ID
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${email},instagram_business_account_id.eq.${instagramUserId}`)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this Instagram account already exists. Please login instead." },
        { status: 400 }
      );
    }

    // 3. Determine User Type strictly
    // If userType is provided by frontend, use it. Otherwise fallback to follower count.
    const finalUserType = userType || (followersCount && followersCount > 10000 ? "business" : "creator");
    
    console.log("[v0] Final User Type determined as:", finalUserType);

    // 4. Create Auth User with the provided email
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: instagramUserId, // Using ID as synthetic password
      options: {
        data: {
          user_type: finalUserType,
          display_name: metaUserName || instagramHandle,
          full_name: metaUserName,
          profile_image_url: metaProfilePicture,
          // Include additional profile data
          phone,
          website,
          instagram_handle: instagramHandle,
          instagram_user_id: instagramUserId,
          ...(finalUserType === 'creator' ? {
            niche,
            content_style,
            languages,
          } : {
            business_type,
            business_description,
          })
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/auth/pending-approval`,
      },
    });

    if (signUpError) {
      console.error("[v0] Error signing up user:", signUpError);
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // 5. Auto-confirm email
    try {
      await supabase.auth.admin.updateUserById(authData.user.id, { email_confirm: true });
    } catch (e) {
      console.error("[v0] Auto-confirm warning:", e);
    }

    // 6. Prepare FULL Profile Update Object
    // This ensures phone, niche, business_type etc. are actually saved.
    const profileUpdates: any = {
      // Standard Fields
      display_name: metaUserName || instagramHandle,
      profile_image_url: metaProfilePicture,
      user_type: finalUserType,
      phone: phone || null,
      website: website || null,
      
      // Location
      country: country || null,
      state: state || null,
      city: city || null,

      // Meta / Instagram Data
      meta_access_token: accessToken,
      meta_page_access_token: pageAccessToken,
      meta_user_id: metaUserId,
      meta_token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      instagram_business_account_id: instagramUserId,
      instagram_handle: instagramHandle,
      facebook_page_id: facebookPageId,

      // Status
      profile_complete: true,
      profile_completed_at: new Date().toISOString(),
    };

    // Add Conditional Fields
    if (finalUserType === 'creator') {
      profileUpdates.niche = niche || null;
      profileUpdates.content_style = content_style || null;
      profileUpdates.languages = Array.isArray(languages) ? languages : null;
    } else if (finalUserType === 'business') {
      profileUpdates.business_type = business_type || null;
      profileUpdates.business_description = business_description || null;
      // Ensure creator fields are null for business
      profileUpdates.niche = null;
    }

    console.log("[v0] Saving to public.users:", profileUpdates);

    // 7. Execute Update
    const { error: updateError } = await supabase
      .from("users")
      .update(profileUpdates)
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("[v0] Database update failed:", updateError);
      return NextResponse.json({ error: "Failed to save profile details." }, { status: 500 });
    }

    // 8. Async Insights Fetch (Optional)
    (async () => {
      try {
        const insightsResponse = await fetch(
          `https://graph.facebook.com/v21.0/${instagramUserId}?fields=username,name,biography&access_token=${pageAccessToken}`
        );
        if (insightsResponse.ok) {
          const insights = await insightsResponse.json();
          if (insights.biography) {
            await supabase.from("users").update({ bio: insights.biography }).eq("id", authData.user.id);
          }
        }
      } catch (err) {
        console.error("[v0] Insights fetch error:", err);
      }
    })();

    // 9. Send welcome email (async - don't wait for it)
    (async () => {
      try {
        const welcomeEmailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            name: metaUserName || instagramHandle,
            userType: finalUserType === 'business' ? 'brand' : 'creator'
          }),
        });

        if (!welcomeEmailResponse.ok) {
          const error = await welcomeEmailResponse.json();
          console.error('Failed to send welcome email:', error);
        }
      } catch (err) {
        console.error('Error sending welcome email:', err);
      }
    })();

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      email: email,
      requiresApproval: true,
    });
    
  } catch (error: any) {
    console.error("[v0] Instagram signup exception:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}