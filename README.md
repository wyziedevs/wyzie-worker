## Cloudflare Worker Proxy for Wyzie API

A lightweight [Nitro](https://nitro.build/)-based Cloudflare Worker that proxies requests to the [Wyzie Subs API](https://sub.wyzie.io/), automatically injecting your API token.

### Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set your API token and worker key for local development**
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
   Build in a shell **without** the real `NITRO_*` values exported: Nitro bakes the build environment's values into the bundle as defaults. Production values belong in Worker secrets (below).

### Deployment

The repo ships a `wrangler.toml` (Worker name `wyzie-worker`, entry `.output/server/index.mjs`), so from the project root:

```bash
pnpm build
npx wrangler deploy
```

Rename the Worker by changing `name` in `wrangler.toml`. Then set the secrets once, via Wrangler or in the Cloudflare dashboard:

```bash
npx wrangler secret put NITRO_API_TOKEN    # your Wyzie Subs API key
npx wrangler secret put NITRO_WORKER_KEY   # the Bearer token your servers will send
```

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `/*` | Proxies all requests to `sub.wyzie.io` (requires auth) |
| `/health` | Health check endpoint (public) |

### Authentication

There are two ways in. Use either or both.

**Server-to-server (default).** Your backend sends an `Authorization` header with a Bearer token matching `NITRO_WORKER_KEY`:

```
Authorization: Bearer your_worker_key
```

Requests without a valid key receive `401 Unauthorized`. Never put this token in browser code: anything shipped to a browser is public.

**Browser mode (optional).** To call the proxy straight from your website's front end, list your site's origins in `NITRO_ALLOWED_ORIGINS` (comma-separated, exactly as the browser sends them, e.g. `https://mysite.com,https://www.mysite.com`). A request whose `Origin` header is on the list:

- gets CORS headers for that origin (`Access-Control-Allow-Origin: <origin>`, `Vary: Origin`),
- has its `OPTIONS` preflight answered by the Worker (`204`),
- is allowed **without** the Bearer key.

Everything else still needs the Bearer key. Set it as a plain variable (it isn't secret), either in `wrangler.toml`:

```toml
[vars]
NITRO_ALLOWED_ORIGINS = "https://mysite.com,https://www.mysite.com"
```

or with `npx wrangler secret put NITRO_ALLOWED_ORIGINS` / the dashboard.

> **What an origin allowlist does and doesn't do.** It stops *other websites* from using your proxy from their visitors' browsers, because browsers set `Origin` truthfully and enforce CORS. It does **not** stop scripts, bots or servers: `Origin` is just a request header, and anyone can send `Origin: https://mysite.com` from curl and spend your key's quota. If that matters, add Cloudflare rate limiting (or a WAF rule) in front of the Worker, and keep an eye on your usage.

**Fail closed.** If neither `NITRO_WORKER_KEY` nor `NITRO_ALLOWED_ORIGINS` is set, every request except `/health` is rejected with `503 Proxy not configured`. The proxy injects your API token upstream, so it never runs unauthenticated. With only `NITRO_ALLOWED_ORIGINS` set, requests from other origins get `401`. The `/health` endpoint is always public.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NITRO_API_TOKEN` | Your Wyzie Subs API key (required; secret) |
| `NITRO_WORKER_KEY` | Bearer token for server-to-server requests (secret). Without it, only allow-listed browser origins can use the proxy |
| `NITRO_ALLOWED_ORIGINS` | Optional, comma-separated site origins allowed to call the proxy from the browser without the Bearer key (see Browser mode) |

With neither `NITRO_WORKER_KEY` nor `NITRO_ALLOWED_ORIGINS`, all proxy requests return 503.
