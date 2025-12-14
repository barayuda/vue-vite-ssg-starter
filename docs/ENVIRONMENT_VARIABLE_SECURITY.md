# Environment Variable Security Guide

This guide explains how to securely manage environment variables in your Vite application, especially when building for production.

## Overview

In Vite, environment variables prefixed with `VITE_` are **exposed to client code**. This means they are bundled into your JavaScript and can be viewed by anyone who inspects your application's code.

## Critical Security Rules

### ❌ NEVER Do This

```bash
# These will be exposed to client code!
VITE_API_SECRET_KEY=your-secret-key
VITE_DATABASE_PASSWORD=password123
VITE_PRIVATE_TOKEN=token-here
VITE_AUTH_KEY=secret-auth-key
```

### ✅ DO This Instead

```bash
# Safe: Public configuration (OK to expose)
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My Application
VITE_PUBLIC_FEATURE_FLAG=true

# Safe: Server-side only (not exposed)
API_SECRET_KEY=your-secret-key
DATABASE_PASSWORD=password123
PRIVATE_TOKEN=token-here
AUTH_KEY=secret-auth-key
```

## How Vite Handles Environment Variables

### Variables Exposed to Client (`VITE_` prefix)

- **Accessible in**: Browser/client code
- **Bundled into**: JavaScript bundle
- **Visible to**: Anyone who inspects your app
- **Use for**: Public configuration, API URLs, feature flags

```typescript
// ✅ Safe to use in client code
const apiUrl = import.meta.env.VITE_API_URL
const appName = import.meta.env.VITE_APP_NAME
```

### Variables NOT Exposed (no `VITE_` prefix)

- **Accessible in**: Build-time code only (Node.js)
- **Bundled into**: Nothing (not included in bundle)
- **Visible to**: Only server/build process
- **Use for**: Secrets, tokens, passwords, database URLs

```typescript
// ❌ This won't work in client code
const secret = import.meta.env.API_SECRET_KEY // undefined!

// ✅ Only works in build-time code (vite.config.ts, plugins, etc.)
const secret = process.env.API_SECRET_KEY
```

## Automatic Security Validation

The build process automatically validates environment variables:

### Development Mode

- **Behavior**: Logs warnings for security violations
- **Action**: Continues building (allows development to proceed)
- **Output**: Yellow warnings in console

### Production Builds

- **Behavior**: Throws errors for security violations
- **Action**: **Fails the build** if violations are found
- **Output**: Red error messages, build stops

### What Gets Checked

1. Variables with `VITE_` prefix that match sensitive patterns:
   - `*PASSWORD*`, `*SECRET*`, `*KEY*`, `*TOKEN*`, `*AUTH*`, `*CREDENTIAL*`
   - `API_KEY`, `PRIVATE_*`, `ACCESS_TOKEN`, `REFRESH_TOKEN`

2. Values that look like tokens/secrets (long alphanumeric strings)

## Best Practices

### 1. Separate Public and Private Variables

```bash
# .env.development (can be committed)
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=My App
VITE_ENABLE_FEATURE_X=true

# .env.production (NEVER commit)
VITE_API_URL=https://api.production.com
# Secrets without VITE_ prefix
API_SECRET_KEY=production-secret
DATABASE_URL=postgresql://...
```

### 2. Use Different Files for Different Environments

```bash
.env.development      # Development config (safe to commit)
.env.production       # Production config (NEVER commit)
.env.local            # Local overrides (gitignored)
```

### 3. Never Commit Secrets

Add to `.gitignore`:

```gitignore
.env.local
.env.production
.env*.local
```

### 4. Use Build-Time Variables for Secrets

If you need secrets during build (e.g., for SSG):

```typescript
// vite.config.ts (build-time only)
const apiKey = process.env.API_SECRET_KEY // ✅ Safe: not exposed

// src/main.ts (client code)
const apiKey = import.meta.env.VITE_API_SECRET_KEY // ❌ Exposed!
```

### 5. Validate Before Building

The build process automatically validates, but you can also check manually:

```bash
# Check for violations
pnpm build
```

## Common Patterns

### Pattern 1: API Configuration

```bash
# ✅ Safe: Public API URL
VITE_API_URL=https://api.example.com

# ❌ Unsafe: API key exposed
VITE_API_KEY=secret-key-123
```

**Solution**: Use server-side authentication or API keys stored server-side.

### Pattern 2: Feature Flags

```bash
# ✅ Safe: Public feature flags
VITE_ENABLE_NEW_FEATURE=true
VITE_MAINTENANCE_MODE=false
```

### Pattern 3: Third-Party Service Keys

```bash
# ✅ Safe: Public keys (meant to be public)
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# ❌ Unsafe: Secret keys
VITE_RECAPTCHA_SECRET_KEY=secret-key-here
```

**Note**: Some services (like reCAPTCHA) have separate public and secret keys. Only the public key should use `VITE_` prefix.

### Pattern 4: Database and Backend URLs

```bash
# ❌ Unsafe: Database URL with credentials
VITE_DATABASE_URL=postgresql://user:password@host:5432/db

# ✅ Safe: Public API endpoint
VITE_API_URL=https://api.example.com
```

## Troubleshooting

### Build Fails with Security Violations

**Error**: `Environment variable security violations detected`

**Solution**:
1. Identify the violating variables
2. Remove `VITE_` prefix from sensitive variables
3. Move sensitive variables to server-side code only
4. Rebuild

### Variable Not Available in Client Code

**Problem**: `import.meta.env.MY_VAR` is `undefined`

**Solution**: Add `VITE_` prefix if it's meant to be public:
```bash
# Change from:
MY_VAR=value

# To:
VITE_MY_VAR=value
```

**Warning**: Only do this if the variable is safe to expose!

### Need Secrets in Client Code

**Problem**: Need to use a secret in client code

**Solution**: **Don't do this!** Instead:
1. Use server-side API endpoints
2. Implement authentication/authorization
3. Use public keys meant for client-side use
4. Consider using environment-specific public configurations

## Production Checklist

Before deploying to production:

- [ ] Review all `VITE_` prefixed variables
- [ ] Ensure no secrets use `VITE_` prefix
- [ ] Verify `.env.production` is in `.gitignore`
- [ ] Test production build: `pnpm build`
- [ ] Check build output for exposed variables
- [ ] Use environment-specific configuration
- [ ] Set up proper secret management (e.g., CI/CD secrets)

## Additional Resources

- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [OWASP Environment Variable Security](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App: Config](https://12factor.net/config)

