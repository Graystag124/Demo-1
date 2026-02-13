// Meta API integration utilities

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MetaUserData {
  id: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface InstagramBusinessAccount {
  instagram_business_account?: {
    id: string;
  };
  id: string; // Facebook Page ID
}

export async function exchangeCodeForToken(code: string): Promise<MetaTokenResponse> {
  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/instagram/callback`;

  const response = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&client_secret=${appSecret}` +
    `&code=${code}`
  );

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }

  return response.json();
}

export async function getMetaUserData(accessToken: string): Promise<MetaUserData> {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/me?fields=id,name,picture&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Meta user data");
  }

  return response.json();
}

export async function getInstagramBusinessAccount(
  accessToken: string,
  pageId: string
): Promise<InstagramBusinessAccount> {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Instagram Business Account");
  }

  return response.json();
}

export async function getInstagramInsights(
  accessToken: string,
  igAccountId: string,
  metrics: string[] = ["impressions", "reach", "follower_count"]
) {
  const metricsParam = metrics.join(",");
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${igAccountId}/insights?metric=${metricsParam}&period=day&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Instagram insights");
  }

  return response.json();
}

export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<MetaTokenResponse> {
  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;

  const response = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `grant_type=fb_exchange_token` +
    `&client_id=${appId}` +
    `&client_secret=${appSecret}` +
    `&fb_exchange_token=${shortLivedToken}`
  );

  if (!response.ok) {
    throw new Error("Failed to exchange for long-lived token");
  }

  return response.json();
}

export async function refreshLongLivedToken(currentToken: string): Promise<MetaTokenResponse> {
  // Facebook long-lived tokens are valid for 60 days
  // This will extend the token by another 60 days
  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;

  const response = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `grant_type=fb_exchange_token` +
    `&client_id=${appId}` +
    `&client_secret=${appSecret}` +
    `&fb_exchange_token=${currentToken}`
  );

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
}

export async function getPagesList(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pages list");
  }

  return response.json();
}

export async function getFacebookPageInsights(
  accessToken: string,
  pageId: string,
  metrics: string[] = ["page_impressions", "page_engaged_users", "page_post_engagements"]
) {
  const metricsParam = metrics.join(",");
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}/insights?metric=${metricsParam}&period=day&access_token=${accessToken}`
  );

  if (!response.ok) {
    if (response.status === 503) {
      throw new Error("Meta API temporarily unavailable (503). Please try again in a few minutes.");
    }
    throw new Error(`Failed to fetch Facebook Page insights (${response.status})`);
  }

  return response.json();
}

export function getMetaAuthUrl(userType: "creator" | "business", useConfigId: boolean = true, fallbackToScopes: boolean = true): string {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/instagram/callback`;
  
  console.log("[v0] Generating Meta Auth URL");
  console.log("[v0] App ID:", appId);
  console.log("[v0] Redirect URI:", redirectUri);
  console.log("[v0] User Type:", userType);

  // Instagram required permissions
  const scopes = [
    "instagram_basic",
    "pages_show_list", 
    "instagram_content_publish",
    "business_management",
    "pages_read_engagement",
    "instagram_manage_insights"
  ];

  if (useConfigId) {
    const configId = "1265845242421860";
    console.log("[v0] Using Config ID:", configId);
    
    return (
      `https://www.facebook.com/v21.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${userType}` +
      `&config_id=${configId}` +
      `&response_type=code` +
      `&fallback_url=${encodeURIComponent(`${window.location.origin}?fallback=true`)}`
    );
  } else {
    console.log("[v0] Using individual scopes:", scopes.join(","));
    
    return (
      `https://www.facebook.com/v21.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${userType}` +
      `&scope=${encodeURIComponent(scopes.join(","))}` +
      `&response_type=code`
    );
  }
}
