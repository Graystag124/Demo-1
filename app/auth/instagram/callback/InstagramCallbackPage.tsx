"use client";

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function InstagramCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [message, setMessage] = useState("Processing Instagram authentication...")
  const [showRetryButton, setShowRetryButton] = useState(false)
  const hasHandledRef = useRef(false)

  useEffect(() => {
    if (hasHandledRef.current) return
    hasHandledRef.current = true

    const handleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const error = searchParams.get("error")
      const errorDescription = searchParams.get("error_description")
      const errorReason = searchParams.get("error_reason")

      console.log("[v0] === Instagram OAuth Callback ===")
      console.log("[v0] Code:", code ? "Present" : "Missing")
      console.log("[v0] State:", state)
      console.log("[v0] Error:", error)
      console.log("[v0] Error Description:", errorDescription)
      console.log("[v0] Error Reason:", errorReason)
      console.log("[v0] Full URL:", window.location.href)
      console.log("[v0] ==================================")

      if (error) {
        console.error("[v0] OAuth error:", error, errorDescription, errorReason)
        setStatus("error")

        let errorMessage = errorDescription || error

        if (error === "access_denied") {
          errorMessage = "You cancelled the Meta connection. Please try again."
        } else if (error === "redirect_uri_mismatch") {
          errorMessage =
            "Redirect URI mismatch. Please ensure your Facebook Login settings include: " +
            window.location.origin +
            "/auth/instagram/callback"
        }

        setMessage(`Authentication failed: ${errorMessage}`)
        setTimeout(() => {
          window.location.href = state?.includes("signup") ? "/auth/sign-up" : "/auth/login"
        }, 3000)
        return
      }

      try {
        // Add timeout wrapper for API calls
        const fetchWithTimeout = async (url: string, timeout = 10000) => {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), timeout)
          
          try {
            const response = await fetch(url, { signal: controller.signal })
            clearTimeout(timeoutId)
            return response
          } catch (error) {
            clearTimeout(timeoutId)
            throw error
          }
        }

        // Support implicit grant (response_type=token): parse access_token from URL hash if present
        const hash = window.location.hash || ""
        const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash)
        const hashAccessToken = hashParams.get("access_token")

        const redirectUri = `${window.location.origin}/auth/instagram/callback`

        console.log("[v0] Exchanging authorization code for access token...")
        console.log("[v0] Redirect URI:", redirectUri)

        // Determine access token
        let accessToken: string
        if (hashAccessToken) {
          // Implicit grant
          accessToken = hashAccessToken
          console.log("[v0] Obtained access token via implicit grant")
        } else {
          if (!code) {
            setStatus("error")
            setMessage("No authorization code or access token received from Meta Login")
            setTimeout(() => {
              window.location.href = state?.includes("signup") ? "/auth/sign-up" : "/auth/login"
            }, 3000)
            return
          }

          // Make the token exchange call with proper body
          const tokenExchangeResponse = await fetch("/api/auth/instagram/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, redirectUri }),
          })
          
          if (!tokenExchangeResponse.ok) {
            const errorData = await tokenExchangeResponse.json()
            console.error("[v0] Token exchange failed:", errorData)
            throw new Error(errorData.error || "Failed to get access token")
          }

          const tokenJson = await tokenExchangeResponse.json()
          accessToken = tokenJson.accessToken
          console.log("[v0] Successfully obtained access token (Meta)")
        }

        // Fetch Facebook Pages with timeout
        console.log("[v0] Fetching Facebook Pages...")
        let pagesResponse: Response
        try {
          pagesResponse = await fetchWithTimeout(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`, 10000)
        } catch (error) {
          console.error("[v0] Timeout or error fetching Facebook Pages:", error)
          throw new Error("Request timed out while fetching Facebook Pages. Please try again.")
        }
        
        const pagesData = await pagesResponse.json()

        console.log("[v0] Facebook Pages response:", pagesData)

        if (pagesData.error) {
          console.error("[v0] Pages API error:", pagesData.error)
          throw new Error(pagesData.error.message || "Failed to fetch Facebook Pages")
        }

        if (!pagesData.data || pagesData.data.length === 0) {
          throw new Error(
            "No Facebook Pages found. Please link your Instagram Business/Creator account to a Facebook Page, then try again.",
          )
        }

        // Iterate all pages to find a linked IG account with timeout handling
        let instagramUserId: string | null = null
        let selectedPageAccessToken: string | null = null
        let facebookPageId: string | null = null
        
        for (const page of pagesData.data) {
          try {
            const pId = page.id
            const pToken = page.access_token
            const pageResp = await fetchWithTimeout(
              `https://graph.facebook.com/v21.0/${pId}?fields=instagram_business_account,connected_instagram_account&access_token=${pToken}`,
              8000
            )
            const pageData = await pageResp.json()
            
            console.log(`[v0] Page ${page.id} data:`, pageData)
            
            if (pageData.instagram_business_account?.id) {
              console.log("[v0] Found instagram_business_account:", pageData.instagram_business_account.id)
              instagramUserId = pageData.instagram_business_account.id
              selectedPageAccessToken = pToken
              facebookPageId = pId
              break
            }
            if (pageData.connected_instagram_account?.id) {
              console.log("[v0] Found connected_instagram_account:", pageData.connected_instagram_account.id)
              instagramUserId = pageData.connected_instagram_account.id
              selectedPageAccessToken = pToken
              facebookPageId = pId
              break
            }
          } catch (error) {
            console.warn(`[v0] Error checking page ${page.id}:`, error)
            continue
          }
        }

        if (!instagramUserId || !selectedPageAccessToken) {
          const detailedError = "No Instagram account found. Please make sure you have an Instagram Business or Creator account and it's linked to a Facebook Page.\n\n" +
            "To fix this:\n" +
            "1. Open Instagram app → Settings → Account → Switch to Professional Account\n" +
            "2. Choose Business or Creator account\n" +
            "3. Go to Settings → Account → Linked Accounts → Facebook\n" +
            "4. Connect your Facebook Page\n" +
            "5. Try login again\n\n" +
            "This is required by Meta's API for accessing Instagram data.";
          
          // Show retry button for this specific error
          if (detailedError.includes("Instagram Business/Creator account")) {
            setShowRetryButton(true)
          }
          
          console.error("[v0] No Instagram account found. Pages checked:", pagesData.data?.length || 0)
          throw new Error(detailedError);
        }

        // Get Instagram username using the Page access token with timeout
        console.log("[v0] Fetching Instagram username for ID:", instagramUserId)
        let igUserData: any
        try {
          const igUserResponse = await fetchWithTimeout(
            `https://graph.facebook.com/v21.0/${instagramUserId}?fields=username&access_token=${selectedPageAccessToken}`,
            8000
          )
          igUserData = await igUserResponse.json()
        } catch (error) {
          console.error("[v0] Error fetching Instagram username:", error)
          throw new Error("Request timed out while fetching Instagram username. Please try again.")
        }

        if (igUserData.error) {
          console.error("[v0] Instagram user fetch error:", igUserData.error)
          throw new Error(igUserData.error.message || "Failed to fetch Instagram username")
        }

        // Fetch followers_count with timeout (optional)
        let followersCount: number | null = null
        try {
          const fcUrl = new URL(`https://graph.facebook.com/v21.0/${instagramUserId}`)
          fcUrl.searchParams.set("fields", "followers_count")
          fcUrl.searchParams.set("access_token", selectedPageAccessToken!)
          const fcResp = await fetchWithTimeout(fcUrl.toString(), 5000)
          if (fcResp.ok) {
            const fcData = await fcResp.json()
            if (!fcData.error && typeof fcData.followers_count === "number") {
              followersCount = fcData.followers_count
            }
          }
        } catch (error) {
          console.warn("[v0] Could not fetch followers count:", error)
          // Don't fail the entire flow for this optional data
        }

        // Fetch basic Meta user data with timeout
        console.log("[v0] Fetching Meta user data...")
        let meData: any
        try {
          const meResponse = await fetchWithTimeout(
            `https://graph.facebook.com/v21.0/me?fields=id,name,email,picture&access_token=${accessToken}`,
            8000
          )
          meData = await meResponse.json()
        } catch (error) {
          console.error("[v0] Error fetching Meta user data:", error)
          // Use minimal data if this fails
          meData = { id: "", name: "", email: "", picture: { data: { url: "" } } }
        }

        console.log("[v0] Successfully authenticated:", igUserData.username)

        setStatus("success")
        setMessage("Successfully connected! Redirecting...")

        // Prepare auth data
        const authData = {
          accessToken,
          pageAccessToken: selectedPageAccessToken,
          instagramUserId,
          instagramHandle: `@${igUserData.username}`,
          facebookPageId,
          followersCount,
          provider: "business",
          metaUserId: meData.id,
          metaUserName: meData.name,
          metaUserEmail: meData.email,
          metaProfilePicture: meData.picture?.data?.url,
        }

        console.log("[v0] State parameter:", state)
        console.log("[v0] Is signup:", state?.includes("signup"))
        console.log("[v0] Is login:", state?.includes("login"))

        // Handle based on state parameter
        if (state?.includes("signup")) {
          // Store data in sessionStorage for signup flow
          sessionStorage.setItem('instagramAuthData', JSON.stringify(authData))
          setTimeout(() => {
            window.location.href = "/auth/sign-up"
          }, 1500)
        } else if (state?.includes("login")) {
          // Direct login flow with timeout
          try {
            const loginResponse = await fetch("/api/auth/instagram/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(authData),
            })
            
            if (!loginResponse.ok) {
              const errorText = await loginResponse.text()
              console.error('[v0] Login API error response:', errorText)
              let responseData
              try {
                responseData = JSON.parse(errorText)
              } catch {
                responseData = { error: "Server error occurred" }
              }
              
              if (responseData.shouldSignup) {
                sessionStorage.setItem('instagramAuthData', JSON.stringify(authData))
                setTimeout(() => {
                  window.location.href = "/auth/sign-up"
                }, 1500)
                return
              }
              throw new Error(responseData.error || "Failed to login with Instagram")
            }

            const loginResult = await loginResponse.json()
            console.log('[v0] Login successful:', loginResult)

            setTimeout(() => {
              window.location.href = "/dashboard"
            }, 1500)
          } catch (err: any) {
            console.error('[v0] Instagram login error:', err)
            setStatus("error")
            setMessage(err.message || "Failed to login with Instagram")
            setTimeout(() => {
              window.location.href = "/auth/login"
            }, 3000)
          }
        } else {
          // Default to login if state is unclear
          sessionStorage.setItem('instagramAuthData', JSON.stringify(authData))
          setTimeout(() => {
            window.location.href = "/auth/login"
          }, 1500)
        }

      } catch (err: any) {
        console.error("[v0] Instagram authentication error:", err)
        setStatus("error")
        setMessage(err.message || "Authentication failed")
        setTimeout(() => {
          window.location.href = state?.includes("signup") ? "/auth/sign-up" : "/auth/login"
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 bg-card border border-border rounded-xl px-8 py-6 shadow-sm max-w-md mx-4">
        {status === "processing" && <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />}
        {status === "success" && (
          <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === "error" && (
          <div className="w-10 h-10 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <p className="text-muted-foreground whitespace-pre-line">{message}</p>
        {status === "error" && showRetryButton && (
          <button
            onClick={() => {
              setShowRetryButton(false)
              setStatus("processing")
              setMessage("Trying with individual permissions...")
              
              // Redirect to login page with fallback parameter
              const loginUrl = new URL("/auth/login", window.location.origin)
              loginUrl.searchParams.set("fallback", "true")
              window.location.href = loginUrl.toString()
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Try Again with Individual Permissions
          </button>
        )}
      </div>
    </div>
  )
}
