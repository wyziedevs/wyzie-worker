import { defineEventHandler, createError, getHeader, getRequestURL } from "h3";

function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return result === 0;
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  if (url.pathname === "/health") return;

  const config = useRuntimeConfig();
  if (!config.workerKey) return;

  const authHeader = getHeader(event, "authorization") || "";
  const match = authHeader.match(/^bearer\s+(.+)$/i);
  const token = match ? match[1] : "";

  if (!token || !timingSafeEqual(token, config.workerKey)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
});
