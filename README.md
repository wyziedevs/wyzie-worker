## Cloudflare Worker Proxy for Wyzie API

A lightweight [Nitro](https://nitro.build/)-based Cloudflare Worker that proxies requests to the [Wyzie Subs API](https://sub.wyzie.io/), automatically injecting your API token.

### Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set your API token**
   ```bash
   export NITRO_API_TOKEN="your_api_key"
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

Set the `NITRO_API_TOKEN` secret in your Cloudflare dashboard or via Wrangler:
```bash
npx wrangler secret put NITRO_API_TOKEN
```

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `/*` | Proxies all requests to `sub.wyzie.io` |
| `/health` | Health check endpoint |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NITRO_API_TOKEN` | Your Wyzie Subs API key (required) |
