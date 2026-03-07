<p align="center">
  <a href="https://sub.wyzie.ru/">
    <img src="https://i.postimg.cc/L5ppKYC5/cclogo.png" height="120">
    <h1 align="center">Wyzie Worker</h1>
  </a>
</p>

## Cloudflare Worker Proxy for Wyzie Subs API

A lightweight [Nitro](https://nitro.build/)-based Cloudflare Worker that proxies requests to the [Wyzie Subs API](https://sub.wyzie.ru/), automatically injecting your API token.

### Features

- **Transparent Proxy**: Forwards all requests to `sub.wyzie.ru` with automatic API key injection
- **Edge Deployment**: Built for Cloudflare Workers with minimal latency
- **Simple Setup**: Just set your API token and deploy

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
| `/*` | Proxies all requests to `sub.wyzie.ru` |
| `/health` | Health check endpoint |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NITRO_API_TOKEN` | Your Wyzie Subs API key (required) |

### Related

- [Wyzie Subs API](https://sub.wyzie.ru/) - The main subtitle scraper API
