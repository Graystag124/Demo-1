import { createClient } from "@/lib/supabase/server";
import { refreshLongLivedToken } from "@/lib/meta";
import { NextResponse } from "next/server";

// This API route automatically checks and refreshes Meta tokens
// Can be called on app load or periodically via cron
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!userData?.meta_access_token) {
      return NextResponse.json(
        { error: "No Meta account connected" },
        { status: 400 }
      );
    }

    // Check if token expires in the next 7 days
    if (userData.meta_token_expires_at) {
      const expiresAt = new Date(userData.meta_token_expires_at);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      if (expiresAt < sevenDaysFromNow) {
        // Refresh the token
        const tokenResponse = await refreshLongLivedToken(userData.meta_access_token);
        
        const newExpiresAt = new Date();
        newExpiresAt.setSeconds(newExpiresAt.getSeconds() + tokenResponse.expires_in);

        // Update the token in the database
        const { error: updateError } = await supabase
          .from("users")
          .update({
            meta_access_token: tokenResponse.access_token,
            meta_token_expires_at: newExpiresAt.toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          return NextResponse.json(
            { error: "Failed to update token" },
            { status: 500 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          refreshed: true,
          message: "Token refreshed successfully" 
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      refreshed: false,
      message: "Token is still valid" 
    });
  } catch (error) {
    console.error("Error in auto-refresh:", error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
