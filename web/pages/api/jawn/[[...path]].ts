import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Extract Better Auth session token from cookie string
 */
function extractBetterAuthToken(cookieHeader: string): string | null {
  const cookies = parseCookies(cookieHeader);
  return cookies["better-auth.session_token"] || cookies["better-auth.session-token"] || null;
}

/**
 * Extract org ID from cookie string
 */
function extractOrgId(cookieHeader: string): string | null {
  const cookies = parseCookies(cookieHeader);
  return cookies["currentOrgId"] || null;
}

/**
 * Parse cookie header into key-value pairs
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name && rest.length > 0) {
      cookies[name] = decodeURIComponent(rest.join("="));
    }
  });
  return cookies;
}

/**
 * Jawn API Proxy
 * Forwards all requests to the Jawn backend while preserving auth headers and cookies
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const jawnBaseUrl = process.env.NEXT_PUBLIC_HELICONE_JAWN_SERVICE || "http://localhost:8585";

  // Build the target URL
  const path = Array.isArray(req.query.path) ? req.query.path.join("/") : req.query.path || "";
  // Jawn base URL already includes /v1, so don't add it again
  const targetUrl = `${jawnBaseUrl}/${path}${req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;

  // Forward all headers from the original request
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined && key !== "host" && key !== "connection") {
      headers[key] = Array.isArray(value) ? value.join(", ") : value;
    }
  }

  // Ensure auth headers are forwarded
  const authHeaders = ["helicone-authorization", "helicone-org-id", "authorization", "cookie"];
  for (const header of authHeaders) {
    const value = req.headers[header];
    if (value) {
      headers[header] = Array.isArray(value) ? value.join(", ") : value;
    }
  }

  // For Better Auth: if no helicone-authorization header but we have the session cookie,
  // construct the auth header from the cookie
  if (!headers["helicone-authorization"] && headers["cookie"]) {
    const betterAuthToken = extractBetterAuthToken(headers["cookie"]);
    const orgId = extractOrgId(headers["cookie"]);
    if (betterAuthToken) {
      headers["helicone-authorization"] = JSON.stringify({
        _type: "jwt",
        token: betterAuthToken,
        orgId: orgId || "none",
      });
      if (orgId) {
        headers["helicone-org-id"] = orgId;
      }
    }
  }

  // Log for debugging (remove in production)
  console.log(`[Jawn Proxy] ${req.method} ${targetUrl}`);
  const cookies = headers["cookie"] ? parseCookies(headers["cookie"]) : {};
  console.log(`[Jawn Proxy] Available cookies:`, Object.keys(cookies));
  const betterAuthToken = cookies["better-auth.session_token"] || cookies["better-auth.session-token"] || "NOT_FOUND";
  console.log(`[Jawn Proxy] Better Auth token (first 20 chars):`, betterAuthToken.substring(0, 20));
  console.log(`[Jawn Proxy] Auth headers present:`, {
    "helicone-authorization": !!headers["helicone-authorization"],
    "helicone-org-id": !!headers["helicone-org-id"],
    "cookie": !!headers["cookie"],
  });

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
    });

    // Forward response headers
    response.headers.forEach((value, key) => {
      if (key !== "transfer-encoding" && key !== "content-encoding") {
        res.setHeader(key, value);
      }
    });

    // Set status and send response
    res.status(response.status);

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error) {
    console.error("[Jawn Proxy] Error:", error);
    res.status(500).json({ error: "Failed to proxy request to Jawn" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
