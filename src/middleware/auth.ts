import { defineEventHandler, createError, getHeader, getRequestURL } from "h3";

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  if (url.pathname === "/health") return;

  const config = useRuntimeConfig();
  if (!config.workerKey) return;

  const authHeader = getHeader(event, "authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token !== config.workerKey) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
});
