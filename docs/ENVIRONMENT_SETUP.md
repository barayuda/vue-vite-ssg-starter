# Environment Setup Guide

This guide explains how to set up environment variables for development and production.

## Quick Start

1. **Copy the example files:**
   ```bash
   cp .env.development.example .env.development
   cp .env.production.example .env.production
   ```

2. **Customize the values** in `.env.development` for your local setup

3. **Never commit** `.env.development` or `.env.production` to version control

## File Structure

```
.env.development.example    # Template for development (safe to commit)
.env.production.example     # Template for production (safe to commit)
.env.development            # Your local development config (gitignored)
.env.production             # Your production config (gitignored)
```

## Development Setup

### 1. Create `.env.development`

Copy from the example:
```bash
cp .env.development.example .env.development
```

### 2. Configure API Proxy

Set your local API server URL:
```bash
VITE_API_TARGET=http://localhost:3000
```

### 3. Configure Rate Limiting (Optional)

Adjust rate limits if needed:
```bash
VITE_API_RATE_LIMIT_ENABLED=true
VITE_API_RATE_LIMIT_MAX=100
VITE_API_RATE_LIMIT_WINDOW=60000  # 1 minute
```

### 4. Start Development Server

```bash
pnpm dev
```

The server will:
- Load variables from `.env.development`
- Validate environment variables for security
- Set up API proxy and middleware
- Enable rate limiting (if configured)

## Production Setup

### 1. Create `.env.production`

Copy from the example:
```bash
cp .env.production.example .env.production
```

### 2. Configure Production URLs

```bash
VITE_APP_BASE_URL=https://your-production-domain.com
VITE_API_TARGET=https://api.production.com
```

### 3. Set Production Secrets

**Important**: Use CI/CD secrets or secure environment variables (without `VITE_` prefix) for:
- API secret keys
- Database credentials
- Private tokens
- Authentication secrets

### 4. Build for Production

```bash
pnpm build
```

The build will:
- Load variables from `.env.production`
- **Fail if security violations are detected**
- Validate that no secrets use `VITE_` prefix
- Generate optimized production build

## Environment Variable Categories

### ✅ Safe to Expose (VITE_ prefix)

These variables are bundled into client code and are safe to expose:

```bash
# Application config
VITE_APP_ENV=development
VITE_APP_BASE_URL=http://localhost:5173

# Public API endpoints
VITE_API_TARGET=http://localhost:3000

# Public service keys
VITE_RECAPTCHA_SITE_KEY=public-key-here

# Feature flags
VITE_ENABLE_FEATURE_X=true
```

### ❌ Never Expose (No VITE_ prefix)

These variables should **never** use `VITE_` prefix:

```bash
# Secrets (server-side only)
API_SECRET_KEY=secret-key-123
DATABASE_PASSWORD=password123
PRIVATE_TOKEN=token-here

# Build-time only (available in vite.config.ts)
BUILD_API_KEY=build-key-here
```

## Configuration Reference

### Application Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_ENV` | Environment identifier | `development`, `production` |
| `VITE_APP_BASE_URL` | Base URL for the app | `http://localhost:5173` |
| `VITE_APP_PROXY_URL` | Legacy proxy URL | (reserved) |

### API Proxy Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_TARGET` | API proxy target | `http://localhost:3000` |
| `VITE_API_WS_TARGET` | WebSocket proxy target | `ws://localhost:3000` |
| `VITE_API_ENABLE_LOGGING` | Enable request logging | `true`, `false` |
| `VITE_API_ENABLE_CORS` | Enable CORS headers | `true`, `false` |

### Rate Limiting Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_RATE_LIMIT_ENABLED` | Enable rate limiting | `true` |
| `VITE_API_RATE_LIMIT_MAX` | Max requests per window | `100` |
| `VITE_API_RATE_LIMIT_WINDOW` | Time window (ms) | `60000` (1 min) |

### SSG Dynamic Routes Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GUIDES_API_ENDPOINT` | API endpoint for guides | `https://api.example.com/guides` |
| `VITE_GUIDES_API_METHOD` | HTTP method | `GET`, `POST` |
| `VITE_GUIDES_API_HEADERS` | Request headers (JSON) | `{"Authorization": "Bearer TOKEN"}` |
| `VITE_GUIDES_API_BODY` | Request body (JSON) | `{"filter": "published"}` |
| `VITE_GUIDES_API_RESPONSE_PATH` | Response path | `data.guides` |
| `VITE_GUIDES_API_SLUG_FIELD` | Slug field name | `slug` |
| `VITE_GUIDES_API_TIMEOUT` | Request timeout (ms) | `10000` |

## Security Best Practices

### 1. Never Commit Secrets

✅ **DO:**
```bash
# Add to .gitignore
.env.development
.env.production
.env*.local
```

❌ **DON'T:**
```bash
# Never commit these
git add .env.development
git add .env.production
```

### 2. Use VITE_ Prefix Correctly

✅ **Safe (public config):**
```bash
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My App
```

❌ **Unsafe (secrets):**
```bash
VITE_API_SECRET_KEY=secret-123  # ❌ Exposed to client!
VITE_DATABASE_PASSWORD=pass123   # ❌ Exposed to client!
```

✅ **Correct (server-side only):**
```bash
API_SECRET_KEY=secret-123        # ✅ Server-side only
DATABASE_PASSWORD=pass123         # ✅ Server-side only
```

### 3. Validate Before Building

The build process automatically validates environment variables:

```bash
# Development: logs warnings
pnpm dev

# Production: fails build on violations
pnpm build
```

### 4. Use CI/CD Secrets

For production, use your CI/CD platform's secret management:

**GitHub Actions:**
```yaml
env:
  API_SECRET_KEY: ${{ secrets.API_SECRET_KEY }}
```

**Vercel:**
```bash
vercel env add API_SECRET_KEY
```

**Netlify:**
```bash
netlify env:set API_SECRET_KEY "value"
```

## Troubleshooting

### Build Fails with Security Violations

**Error:** `Environment variable security violations detected`

**Solution:**
1. Check which variables are flagged
2. Remove `VITE_` prefix from sensitive variables
3. Move secrets to server-side only variables
4. Rebuild

### Variable Not Available in Client Code

**Problem:** `import.meta.env.MY_VAR` is `undefined`

**Solution:** Add `VITE_` prefix (only if safe to expose):
```bash
# Change from:
MY_VAR=value

# To:
VITE_MY_VAR=value
```

**Warning:** Only do this if the variable is safe to expose!

### API Proxy Not Working

**Problem:** Requests to `/api/*` not proxied

**Solution:**
1. Check `VITE_API_TARGET` is set in `.env.development`
2. Verify the target server is running
3. Check console for proxy errors
4. Ensure URL format is correct (`http://` or `https://`)

## Example Configurations

### Minimal Development Setup

```bash
# .env.development
VITE_APP_ENV=development
VITE_APP_BASE_URL=http://localhost:5173
VITE_API_TARGET=http://localhost:3000
```

### Full Development Setup

```bash
# .env.development
VITE_APP_ENV=development
VITE_APP_BASE_URL=http://localhost:5173
VITE_API_TARGET=http://localhost:3000
VITE_API_WS_TARGET=ws://localhost:3000
VITE_API_ENABLE_LOGGING=true
VITE_API_ENABLE_CORS=true
VITE_API_RATE_LIMIT_ENABLED=true
VITE_API_RATE_LIMIT_MAX=100
VITE_API_RATE_LIMIT_WINDOW=60000
```

### Production Setup

```bash
# .env.production
VITE_APP_ENV=production
VITE_APP_BASE_URL=https://your-domain.com
VITE_API_TARGET=https://api.your-domain.com
VITE_RECAPTCHA_SITE_KEY=your-public-key

# Server-side only (set in CI/CD)
# API_SECRET_KEY=set-in-cicd
# DATABASE_URL=set-in-cicd
```

## Additional Resources

- [Environment Variable Security Guide](./ENVIRONMENT_VARIABLE_SECURITY.md)
- [API Proxy Configuration Guide](./API_PROXY_CONFIGURATION.md)
- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)

