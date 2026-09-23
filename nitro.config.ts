export default defineNitroConfig({
  compatibilityDate: "2026-03-07",
  preset: "cloudflare",
  srcDir: "src",
  minify: true,
  compressPublicAssets: true,
  runtimeConfig: {
    apiToken: process.env.NITRO_API_TOKEN || "",
    workerKey: process.env.NITRO_WORKER_KEY || "",
    // Optional browser mode: comma-separated origins allowed to call the proxy
    // from the browser without the Bearer key (see README).
    allowedOrigins: process.env.NITRO_ALLOWED_ORIGINS || "",
  },
});
