import {
  defineEventHandler,
  createError,
  getHeader,
  getRequestURL,
  sendNoContent,
  setResponseHeaders,
} from "h3";

function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return result === 0;
}

// "https://Example.com/" -> "https://example.com". Browsers send the Origin
// header without a path or trailing slash, lower-cased scheme and host.
function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

// NITRO_ALLOWED_ORIGINS: comma-separated list of site origins allowed to call
// the proxy straight from the browser, e.g. "https://mysite.com,https://www.mysite.com".
function allowedOrigins(raw: unknown): Set<string> {
  return new Set(
    String(raw ?? "")
      .split(",")
      .map(normalizeOrigin)
      .filter(Boolean),
  );
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const origins = allowedOrigins(config.allowedOrigins);
  const origin = getHeader(event, "origin") || "";

  // Browser mode (optional): a page on an allow-listed origin calls the proxy
  // directly, so it can't hold the Bearer key (anything shipped to a browser
  // is public). Such requests get CORS headers for that origin, the preflight
  // is answered here, and no Bearer key is required.
  //
  // This only stops OTHER WEBSITES from using the proxy from their visitors'
  // browsers. Origin is just a request header: any script or server can send
  // an allow-listed Origin and use the proxy (and your key's quota). Put rate
  // limiting in front of it if that matters to you.
  if (origin && origins.has(normalizeOrigin(origin))) {
    setResponseHeaders(event, {
      "access-control-allow-origin": origin,
      vary: "Origin",
    });
    if (event.method === "OPTIONS") {
      setResponseHeaders(event, {
        "access-control-allow-methods": "GET, HEAD, POST, OPTIONS",
        "access-control-allow-headers":
          getHeader(event, "access-control-request-headers") || "content-type",
        "access-control-max-age": 86400,
      });
      return sendNoContent(event, 204);
    }
    return;
  }

  const url = getRequestURL(event);
  if (url.pathname === "/health") return;

  // Server-to-server mode: a Bearer token matching NITRO_WORKER_KEY.
  //
  // Fail CLOSED. This proxy injects a privileged apiToken as the upstream key,
  // so an unauthenticated request here would grant free, billed access to the
  // upstream API. If neither workerKey nor an origin allowlist is configured,
  // reject everything (except /health, handled above) rather than silently
  // disabling auth.
  if (!config.workerKey) {
    if (origins.size === 0) {
      throw createError({ statusCode: 503, statusMessage: "Proxy not configured" });
    }
    // Browser-only deployment: anything that isn't an allow-listed origin is refused.
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const authHeader = getHeader(event, "authorization") || "";
  const match = authHeader.match(/^bearer\s+(.+)$/i);
  const token = match ? match[1] : "";

  if (!token || !timingSafeEqual(token, config.workerKey)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
});
