# API Proxy Configuration Guide

This guide explains how to configure the Vite development server with custom API endpoints, proxy rules, CORS handling, and WebSocket support.

## Overview

The Vite development server is configured with:

1. **API Proxy**: Routes `/api/*` requests to a backend server
2. **WebSocket Proxy**: Routes `/ws` connections to a WebSocket server
3. **Custom API Routes**: Define custom endpoints that run locally
4. **CORS Handling**: Automatic CORS headers for cross-origin requests
5. **Rate Limiting**: Prevents API abuse with configurable rate limits
6. **Request/Response Logging**: Detailed logging of all API requests
7. **Error Handling**: Comprehensive error handling and logging
8. **Environment Variable Security**: Validates environment variables for security issues

## Configuration

### Environment Variables

Add these variables to your `.env.development` file:

```bash
# API Proxy Target
# All requests to /api/* will be proxied to this URL
VITE_API_TARGET=http://localhost:3000

# WebSocket Proxy Target (optional)
# All connections to /ws will be proxied to this URL
VITE_API_WS_TARGET=ws://localhost:3000

# Enable/disable request/response logging
VITE_API_ENABLE_LOGGING=true

# Enable/disable CORS headers
VITE_API_ENABLE_CORS=true

# Rate Limiting Configuration
# Enable/disable rate limiting (default: true)
VITE_API_RATE_LIMIT_ENABLED=true
# Maximum number of requests per window (default: 100)
VITE_API_RATE_LIMIT_MAX=100
# Time window in milliseconds (default: 60000 = 1 minute)
VITE_API_RATE_LIMIT_WINDOW=60000
```

### Example Configurations

#### Basic API Proxy

```bash
VITE_API_TARGET=http://localhost:3000
VITE_API_ENABLE_LOGGING=true
VITE_API_ENABLE_CORS=true
```

All requests to `http://localhost:5173/api/users` will be proxied to `http://localhost:3000/api/users`.

#### API Proxy with Path Rewrite

If your backend doesn't use the `/api` prefix, you can modify the `rewrite` function in `vite.config.ts`:

```typescript
rewrite: (path) => {
  // Remove /api prefix
  return path.replace(/^\/api/, '')
}
```

This will proxy `http://localhost:5173/api/users` to `http://localhost:3000/users`.

#### API Proxy with Authentication

The proxy automatically forwards headers. To add authentication headers, modify the proxy configuration:

```typescript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN',
  'X-Forwarded-Host': 'localhost:5173',
  'X-Forwarded-Proto': 'http',
}
```

#### WebSocket Proxy

```bash
VITE_API_WS_TARGET=ws://localhost:3000
```

All WebSocket connections to `ws://localhost:5173/ws` will be proxied to `ws://localhost:3000`.

## Custom API Routes

You can define custom API routes that run locally without proxying. These are useful for:

- Mock data during development
- Health checks
- Development-only endpoints

### Adding Custom Routes

Edit `vite.config.ts` and add routes to the `customApiRoutes` object:

```typescript
const customApiRoutes: Record<string, (req: IncomingMessage, res: ServerResponse) => void> = {
  '/api/health': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: VITE_APP_ENV || 'development',
    }))
  },
  '/api/mock/users': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]))
  },
}
```

Custom routes are checked **before** the proxy, so they take precedence.

## CORS Configuration

CORS is automatically handled by the middleware. The following headers are set:

- `Access-Control-Allow-Origin`: Matches the request origin (or `*` if not specified)
- `Access-Control-Allow-Methods`: `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type, Authorization, X-Requested-With`
- `Access-Control-Allow-Credentials`: `true`
- `Access-Control-Max-Age`: `86400` (24 hours)

Preflight requests (OPTIONS) are automatically handled.

## Request/Response Logging

When `VITE_API_ENABLE_LOGGING=true`, all API requests are logged with:

- Request method and URL
- Response status code (color-coded)
- Response time
- Error details (if any)

Example log output:

```
[API] 2025-01-15T10:30:00.000Z GET /api/users
[Proxy] GET /api/users -> http://localhost:3000/api/users
[Proxy Response] GET /api/users 200
GET /api/users 200 - 45ms
```

## Error Handling

Errors are automatically caught and logged with:

- Error message
- Stack trace (in development)
- Timestamp
- Request URL

Error responses follow this format:

```json
{
  "error": {
    "message": "Internal Server Error",
    "statusCode": 500,
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

## Usage in Frontend Code

### Using with useFetch Composable

The API proxy works seamlessly with the existing `useFetch` composable:

```typescript
import { useFetch } from '@/composables/useFetch'

// This will be proxied to http://localhost:3000/api/users
const { data, isLoading, error } = useFetch('/api/users')
```

### Using with WebSocket

```typescript
// This will be proxied to ws://localhost:3000
const ws = new WebSocket('ws://localhost:5173/ws')

ws.onopen = () => {
  console.log('WebSocket connected')
}

ws.onmessage = (event) => {
  console.log('Message received:', event.data)
}
```

## Hot Module Replacement (HMR)

The API proxy and middleware are fully compatible with Vite's HMR. API functionality remains intact during hot reloads.

## Production Considerations

**Important**: The proxy configuration only works in development mode (`pnpm dev`). In production:

1. API calls should be made directly to your production API
2. Use environment variables to configure API endpoints
3. Consider using an API gateway or CDN for production

Example production configuration:

```typescript
// In your composable or API utility
const API_BASE_URL = import.meta.env.PROD
  ? 'https://api.production.com'
  : '/api' // Uses proxy in development
```

## Troubleshooting

### Proxy Not Working

1. Check that `VITE_API_TARGET` is set in `.env.development`
2. Verify the target server is running
3. Check the console for proxy errors
4. Ensure the URL format is correct (include `http://` or `https://`)

### CORS Errors

1. Verify `VITE_API_ENABLE_CORS=true` in `.env.development`
2. Check that the middleware is applied (should see logs)
3. Verify the request origin matches the allowed origin

### WebSocket Not Connecting

1. Check that `VITE_API_WS_TARGET` is set correctly
2. Verify the WebSocket server is running
3. Check the console for WebSocket proxy errors
4. Ensure the URL uses `ws://` or `wss://` protocol

### Custom Routes Not Working

1. Verify the route path starts with `/api/`
2. Check that the route is defined before the proxy middleware
3. Ensure the route handler calls `res.end()` or `res.writeHead()`

## Advanced Configuration

### Multiple Proxy Targets

You can configure multiple proxy targets by adding more entries to the `proxy` object:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    // ... configuration
  },
  '/api/v2': {
    target: 'http://localhost:3001',
    // ... configuration
  },
}
```

### Custom Proxy Headers

Modify the `headers` object in the proxy configuration:

```typescript
headers: {
  'X-Custom-Header': 'value',
  'Authorization': `Bearer ${process.env.API_TOKEN}`,
}
```

### Proxy Timeout

Add timeout configuration:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    timeout: 30000, // 30 seconds
    // ... other configuration
  },
}
```

## Rate Limiting

Rate limiting is enabled by default to prevent API abuse. It uses a token bucket algorithm with configurable limits.

### Configuration

```bash
# Enable/disable rate limiting
VITE_API_RATE_LIMIT_ENABLED=true

# Maximum requests per window (default: 100)
VITE_API_RATE_LIMIT_MAX=100

# Time window in milliseconds (default: 60000 = 1 minute)
VITE_API_RATE_LIMIT_WINDOW=60000
```

### How It Works

- Each client (identified by IP address) has a request counter
- Requests are limited to `maxRequests` per `windowMs` milliseconds
- When the limit is exceeded, a `429 Too Many Requests` response is returned
- Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: ISO timestamp when the limit resets
  - `Retry-After`: Seconds until the limit resets

### Example Response

When rate limit is exceeded:

```json
{
  "error": {
    "message": "Too many requests, please try again later",
    "statusCode": 429,
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### Customizing Rate Limits

You can customize rate limits per route or disable it for specific routes in `vite.config.ts`:

```typescript
const rateLimitConfig = {
  maxRequests: 200,        // 200 requests
  windowMs: 60000,          // per minute
  skip: ['/api/health'],    // Skip rate limiting for health checks
}
```

### Production Considerations

**Important**: The built-in rate limiter uses in-memory storage and is suitable for development only. For production:

1. Use a distributed rate limiting solution (Redis, etc.)
2. Implement rate limiting at the API gateway or load balancer level
3. Consider using services like Cloudflare, AWS WAF, or similar

## Environment Variable Security

The build process automatically validates environment variables for security issues.

### Security Checks

The validation checks for:

1. **Sensitive variables with VITE_ prefix**: Variables prefixed with `VITE_` are exposed to client code. If a variable contains sensitive data (passwords, tokens, keys), it should NOT use the `VITE_` prefix.

2. **Common sensitive patterns**: Variables matching patterns like:
   - `*PASSWORD*`, `*SECRET*`, `*KEY*`, `*TOKEN*`, `*AUTH*`, `*CREDENTIAL*`
   - `API_KEY`, `PRIVATE_*`, `ACCESS_TOKEN`, `REFRESH_TOKEN`

### Behavior

- **Development mode**: Logs warnings but continues
- **Production builds**: Throws errors and fails the build if violations are found

### Example Violations

```bash
# ❌ BAD: Sensitive data with VITE_ prefix (exposed to client)
VITE_API_SECRET_KEY=your-secret-key
VITE_DATABASE_PASSWORD=password123

# ✅ GOOD: Non-VITE_ variable (server-side only)
API_SECRET_KEY=your-secret-key
DATABASE_PASSWORD=password123

# ✅ GOOD: Safe VITE_ variable (public configuration)
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My App
```

### Fixing Violations

1. **Move sensitive variables**: Remove `VITE_` prefix for sensitive data
2. **Use server-side variables**: Access sensitive variables only in build-time code (not in client code)
3. **Use environment-specific files**: Keep `.env.production` secure and never commit it

### Example Secure Configuration

```bash
# .env.development (safe to commit)
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=My App

# .env.production (NEVER commit)
VITE_API_URL=https://api.production.com
# Use non-VITE_ variables for secrets
API_SECRET_KEY=production-secret-key
DATABASE_URL=postgresql://...
```

### Manual Validation

You can manually validate environment variables:

```typescript
import { validateEnvironmentVariables } from './src/utils/env-security'

// In development: logs warnings
validateEnvironmentVariables({ strict: false, logWarnings: true })

// In production: throws errors
validateEnvironmentVariables({ strict: true, logWarnings: false })
```

## Security Notes

- Never commit API tokens or secrets to version control
- Use environment variables for sensitive configuration
- **Never use VITE_ prefix for sensitive data** - it will be exposed to client code
- In production, use HTTPS for all API communications
- Validate and sanitize all API responses
- Rate limiting is enabled by default but uses in-memory storage (development only)
- For production, implement rate limiting at the API gateway or use a distributed solution
- Regularly audit environment variables for security issues

