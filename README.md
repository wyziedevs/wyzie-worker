## Cloudflare Worker Proxy for Wyzie API

A lightweight [Nitro](https://nitro.build/)-based Cloudflare Worker that proxies requests to the [Wyzie Subs API](https://sub.wyzie.io/), automatically injecting your API token.

### Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set your API token and worker key**
   ```bash
   export NITRO_API_TOKEN="your_api_key"
   export NITRO_WORKER_KEY="your_worker_key"
   ```

3. **Development**
   ```bash
   pnpm dev
   ```

4. **Build for production**
   ```bash
   pnpm build
   ```

### Deployment

Deploy to Cloudflare Workers:

```bash
pnpm build
npx wrangler deploy .output/server/index.mjs
```

Set the `NITRO_API_TOKEN` and `NITRO_WORKER_KEY` secrets in your Cloudflare dashboard or via Wrangler:
```bash
npx wrangler secret put NITRO_API_TOKEN
npx wrangler secret put NITRO_WORKER_KEY
```

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `/*` | Proxies all requests to `sub.wyzie.io` (requires auth) |
| `/health` | Health check endpoint (public) |

### Authentication

All proxy endpoints require an `Authorization` header with a Bearer token matching the configured `NITRO_WORKER_KEY`:

```
Authorization: Bearer your_worker_key
```

Requests without a valid key will receive a `401 Unauthorized` response. The `/health` endpoint is public and does not require authentication.

If `NITRO_WORKER_KEY` is not set, authentication is disabled and all requests are allowed.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NITRO_API_TOKEN` | Your Wyzie Subs API key (required) |
| `NITRO_WORKER_KEY` | Secret key for authenticating requests to the worker (recommended) |
