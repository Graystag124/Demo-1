import { createClient } from "@/lib/supabase/server";
import { getInstagramInsights } from "@/lib/meta";
import { NextResponse } from "next/server";

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

    // Check if token is expired
    if (userData.meta_token_expires_at) {
      const expiresAt = new Date(userData.meta_token_expires_at);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Meta access token expired. Please reconnect your account." },
          { status: 400 }
        );
      }
    }

    // Fetch insights from Meta API
    // Note: This requires instagram_business_account_id to be set
    if (userData.instagram_business_account_id) {
      const insights = await getInstagramInsights(
        userData.meta_access_token,
        userData.instagram_business_account_id
      );

      // Store insights in database
      const { error: insertError } = await supabase
        .from("meta_insights")
        .insert({
          user_id: user.id,
          insights_data: insights,
          insight_type: "account",
          period_start: new Date().toISOString(),
          period_end: new Date().toISOString(),
        });

      if (insertError) {
        console.error("[v0] Error saving insights:", insertError);
        return NextResponse.json(
          { error: "Failed to save insights" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "No Instagram Business Account connected. Please set up your account in Meta Business Suite." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[v0] Error in refresh insights:", error);
    return NextResponse.json(
      { error: "Failed to refresh insights" },
      { status: 500 }
    );
  }
}
