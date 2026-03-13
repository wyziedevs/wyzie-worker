export default defineNitroConfig({
  compatibilityDate: "2026-03-07",
  preset: "cloudflare",
  srcDir: "src",
  minify: true,
  compressPublicAssets: true,
  runtimeConfig: {
    apiToken: process.env.NITRO_API_TOKEN || "",
    workerKey: process.env.NITRO_WORKER_KEY || "",
  },
});
