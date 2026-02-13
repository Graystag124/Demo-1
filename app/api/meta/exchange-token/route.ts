import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForToken, exchangeForLongLivedToken, getMetaUserData } from "@/lib/meta";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, userType } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code provided" },
        { status: 400 }
      );
    }

    const shortLivedToken = await exchangeCodeForToken(code);
    const tokenData = await exchangeForLongLivedToken(shortLivedToken.access_token);
    
    // Get Meta user data
    const metaUser = await getMetaUserData(tokenData.access_token);

    // Get the authenticated Supabase user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Update user profile with Meta tokens
    const updateData: any = {
      meta_access_token: tokenData.access_token,
      meta_user_id: metaUser.id,
      meta_token_expires_at: expiresAt.toISOString(),
    };

    // If profile picture is available, save it
    if (metaUser.picture?.data?.url) {
      updateData.profile_image_url = metaUser.picture.data.url;
    }

    // For business users, get Instagram Business Account
    if (userType === "business") {
      try {
        // Note: This requires the user to have a Facebook Page connected
        // In production, you'd need to let the user select which page to use
        // For now, we'll skip this and let the user configure it later
        // The Meta API requires page_id which we don't have yet
      } catch (error) {
        console.error("[v0] Error fetching Instagram Business Account:", error);
      }
    }

    const { error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id);

    if (updateError) {
      console.error("[v0] Error updating user:", updateError);
      return NextResponse.json(
        { error: "Failed to save Meta credentials" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error in exchange-token:", error);
    return NextResponse.json(
      { error: "Failed to process Meta authentication" },
      { status: 500 }
    );
  }
}
