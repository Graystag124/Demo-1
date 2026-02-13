import { createClient } from "@/lib/supabase/server";
import { getInstagramInsights, getFacebookPageInsights } from "@/lib/meta";
import { NextResponse } from "next/server";

// This API route automatically fetches and stores insights
// Can be called on dashboard load to always show fresh data
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

    const results: any[] = [];

    // Fetch Instagram insights if available
    if (userData.instagram_business_account_id) {
      try {
        const igInsights = await getInstagramInsights(
          userData.meta_access_token,
          userData.instagram_business_account_id
        );

        await supabase.from("meta_insights").insert({
          user_id: user.id,
          insights_data: igInsights,
          insight_type: "instagram_account",
          period_start: new Date().toISOString(),
          period_end: new Date().toISOString(),
        });

        results.push({ platform: "instagram", success: true });
      } catch (error) {
        console.error("Error fetching Instagram insights:", error);
        results.push({ platform: "instagram", success: false, error: String(error) });
      }
    }

    // Fetch Facebook Page insights if available
    if (userData.facebook_page_id) {
      try {
        const fbInsights = await getFacebookPageInsights(
          userData.meta_access_token,
          userData.facebook_page_id
        );

        await supabase.from("meta_insights").insert({
          user_id: user.id,
          insights_data: fbInsights,
          insight_type: "facebook_page",
          period_start: new Date().toISOString(),
          period_end: new Date().toISOString(),
        });

        results.push({ platform: "facebook", success: true });
      } catch (error) {
        console.error("Error fetching Facebook insights:", error);
        results.push({ platform: "facebook", success: false, error: String(error) });
      }
    }

    return NextResponse.json({ 
      success: true,
      results 
    });
  } catch (error) {
    console.error("Error in auto-refresh insights:", error);
    return NextResponse.json(
      { error: "Failed to refresh insights" },
      { status: 500 }
    );
  }
}
