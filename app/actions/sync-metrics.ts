// "use server";

// import { createClient } from "@/lib/supabase/server";
// import axios from "axios";

// export async function syncSubmissionMetrics(submissionId: string, url: string) {
//   const supabase = await createClient();

//   try {
//     // 1. Extract shortcode from URL (e.g., DQ_tYwqD7WD)
//     const shortcode = url.split("/reel/")[1]?.split("/")[0];
//     if (!shortcode) throw new Error("Invalid Instagram URL");

//     // 2. Fetch data from a scraping service (Example using RapidAPI - Instagram Scraper)
//     // You will need an API key from a service like "Instagram Looper" or "RocketAPI" on RapidAPI
//     const options = {
//       method: 'GET',
//       url: `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info`,
//       params: { code_or_id_or_url: shortcode },
//       headers: {
//         'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
//         'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
//       }
//     };

//     const response = await axios.request(options);
//     const data = response.data.data;

//     const likes = data.like_count || 0;
//     const comments = data.comment_count || 0;
//     const views = data.play_count || 0; // Views is the public version of Reach

//     // 3. Update Supabase
//     const { error } = await supabase
//       .from("collaboration_submissions")
//       .update({
//         likes_count: likes,
//         comments_count: comments,
//         reach_count: views, // Saving views into reach_count
//       })
//       .eq("id", submissionId);

//     if (error) throw error;
//     return { success: true, likes, comments, views };

//   } catch (error) {
//     console.error("Sync error:", error);
//     return { success: false, error: "Could not fetch metrics" };
//   }
// }

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function syncSubmissionMetrics(submissionId: string, url: string) {
  const supabase = await createClient();

  try {
    // 1. Get the Logged-in Business's Meta Credentials
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const { data: businessUser } = await supabase
      .from("users")
      .select("meta_access_token, instagram_business_account_id")
      .eq("id", authUser?.id)
      .single();

    if (!businessUser?.meta_access_token || !businessUser?.instagram_business_account_id) {
      return { success: false, error: "Please connect your Instagram Business account first." };
    }

    // 2. Get the Creator's handle and the post shortcode
    // We need the creator's handle because Business Discovery works via username
    const { data: submission } = await supabase
      .from("collaboration_submissions")
      .select("creator:users!creator_id(instagram_handle)")
      .eq("id", submissionId)
      .single();

    const creatorHandle = (submission?.creator as any)?.instagram_handle;
    const shortcode = url.split("/reel/")[1]?.split("/")[0] || url.split("/p/")[1]?.split("/")[0];

    if (!creatorHandle || !shortcode) {
      return { success: false, error: "Missing creator handle or invalid URL." };
    }

    // 3. Call Meta Graph API (Business Discovery)
    // Field: business_discovery.username(HANDLE){media.shortcode(SHORTCODE){like_count,comments_count}}
    const fields = `business_discovery.username(${creatorHandle}){media.shortcode(${shortcode}){like_count,comments_count}}`;
    const graphUrl = `https://graph.facebook.com/v21.0/${businessUser.instagram_business_account_id}?fields=${fields}&access_token=${businessUser.meta_access_token}`;

    const res = await fetch(graphUrl);
    const result = await res.json();

    if (result.error) {
      console.error("Meta API Error:", result.error);
      return { success: false, error: result.error.message };
    }

    // Extract stats from the nested response
    const mediaObj = result.business_discovery?.media?.data?.[0];
    if (!mediaObj) return { success: false, error: "Post not found or account is private." };

    const likes = mediaObj.like_count || 0;
    const comments = mediaObj.comments_count || 0;
    // Note: Official API doesn't give Reach for others. 
    // We update likes and comments, and leave Reach as is or 0.

    // 4. Update Database
    const { error: dbError } = await supabase
      .from("collaboration_submissions")
      .update({
        likes_count: likes,
        comments_count: comments,
        // reach_count: views, // Cannot get this via official discovery API
      })
      .eq("id", submissionId);

    if (dbError) throw dbError;

    revalidatePath("/business-dashboard/content");
    return { success: true };

  } catch (error: any) {
    console.error("Sync Error:", error);
    return { success: false, error: "An error occurred while syncing with Meta." };
  }
}