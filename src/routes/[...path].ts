import { defineEventHandler, getQuery, readBody, getHeaders, setResponseHeaders } from "h3";

const API_BASE = "https://sub.wyzie.io";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const path = event.context.params?.path || "";
  const query = getQuery(event);
  const method = event.method;
  const queryParams = new URLSearchParams(query as Record<string, string>);
  queryParams.set("key", config.apiToken);
  const queryString = queryParams.toString();
  const targetUrl = `${API_BASE}/${path}${queryString ? `?${queryString}` : ""}`;
  const incomingHeaders = getHeaders(event);
  const headers: HeadersInit = {
    "accept": incomingHeaders["accept"] || "application/json",
  };

  if (incomingHeaders["content-type"]) {
    headers["content-type"] = incomingHeaders["content-type"];
  }
  if (incomingHeaders["accept-language"]) {
    headers["accept-language"] = incomingHeaders["accept-language"];
  }

  const fetchOptions: RequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    const body = await readBody(event);
    if (body) {
      fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
      if (!headers["content-type"]) {
        headers["content-type"] = "application/json";
      }
    }
  }

  const response = await fetch(targetUrl, fetchOptions);

  setResponseHeaders(event, {
    "content-type": response.headers.get("content-type") || "application/json",
    "cache-control": response.headers.get("cache-control") || "public, max-age=60",
  });

  return response.body ?? response.text();
});
