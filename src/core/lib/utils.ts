/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateGoogleOAuthUrl(
  gClientId?: string,
  redirectUri?: string,
): string {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const clientId = gClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENTID || "";

  const finalRedirectUri =
    redirectUri || process.env.NEXT_PUBLIC_REDIRECT_URL || "";

  if (!clientId) {
    throw new Error("Google Client ID is missing");
  }

  if (!finalRedirectUri) {
    throw new Error("Redirect URI is missing");
  }

  const options: Record<string, string> = {
    client_id: clientId,
    redirect_uri: finalRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: "googleHost",
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
}

export const getAccessTokenFromCode = async (
  authorizationCode: any,
  gClientId?: string,
  gSecretId?: string,
  redirectUrl?: string,
) => {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: gClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENTID, // GOOGLE_CLIENTID
        client_secret: gSecretId || process.env.NEXT_PUBLIC_GOOGLE_CLIENTSECRET, // GOOGLE_CLIENTSECRET
        redirect_uri: redirectUrl || process.env.NEXT_PUBLIC_REDIRECT_URL, // GOOGLE_REDIRECT_URI
        grant_type: "authorization_code",
        code: authorizationCode,
      } as Record<string, string>),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // console.log(data, "access_token");
    return data.access_token;
  } catch (error) {
    console.error("Failed to get access token:", error);
    return false;
  }
};
