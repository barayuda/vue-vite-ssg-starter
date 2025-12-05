# API Configuration Guide

This guide explains how to configure the SSG dynamic routes plugin to use a real API instead of the mock API.

## Overview

The `vite-plugin-ssg-dynamic-routes` plugin supports two modes:

1. **Mock API Mode** (default): Reads guide slugs from `src/data/mock-api.ts`
2. **Real API Mode**: Fetches guide slugs from a real API endpoint

## Configuration

### Environment Variables

Add these variables to your `.env.development` or `.env.production` file:

```bash
# API Endpoint (required for real API mode)
VITE_GUIDES_API_ENDPOINT=https://api.example.com/guides

# API Method (optional, default: GET)
VITE_GUIDES_API_METHOD=GET

# API Headers (optional, JSON string)
VITE_GUIDES_API_HEADERS={"Authorization": "Bearer YOUR_TOKEN", "X-API-Key": "your-key"}

# API Body (optional, JSON string, for POST requests)
VITE_GUIDES_API_BODY={"filter": "published"}

# Response Path (optional, for nested responses)
# Example: if API returns { data: { guides: [...] } }, use "data.guides"
VITE_GUIDES_API_RESPONSE_PATH=data.guides

# Slug Field Name (optional, default: "slug")
# The field name in each guide object that contains the slug
VITE_GUIDES_API_SLUG_FIELD=slug

# Request Timeout (optional, default: 10000ms)
VITE_GUIDES_API_TIMEOUT=10000
```

### Example Configurations

#### Simple GET Request

```bash
VITE_GUIDES_API_ENDPOINT=https://api.example.com/guides
```

#### GET Request with Authentication

```bash
VITE_GUIDES_API_ENDPOINT=https://api.example.com/guides
VITE_GUIDES_API_HEADERS={"Authorization": "Bearer YOUR_TOKEN"}
```

#### POST Request with Body

```bash
VITE_GUIDES_API_ENDPOINT=https://api.example.com/guides/search
VITE_GUIDES_API_METHOD=POST
VITE_GUIDES_API_BODY={"status": "published", "limit": 100}
VITE_GUIDES_API_HEADERS={"Content-Type": "application/json", "Authorization": "Bearer YOUR_TOKEN"}
```

#### Nested Response Structure

If your API returns data in a nested structure:

```json
{
  "success": true,
  "data": {
    "guides": [
      { "slug": "guide-1", "title": "Guide 1" },
      { "slug": "guide-2", "title": "Guide 2" }
    ]
  }
}
```

Configure it like this:

```bash
VITE_GUIDES_API_ENDPOINT=https://api.example.com/guides
VITE_GUIDES_API_RESPONSE_PATH=data.guides
```

#### Custom Slug Field

If your API uses a different field name for the slug:

```bash
VITE_GUIDES_API_ENDPOINT=https://api.example.com/guides
VITE_GUIDES_API_SLUG_FIELD=id
```

## API Response Format

The API should return an array of guide objects, or the response path should point to an array.

### Expected Format

```json
[
  { "slug": "guide-1", "title": "Guide 1" },
  { "slug": "guide-2", "title": "Guide 2" }
]
```

Or with nested structure:

```json
{
  "data": {
    "guides": [
      { "slug": "guide-1", "title": "Guide 1" },
      { "slug": "guide-2", "title": "Guide 2" }
    ]
  }
}
```

## Caching

The plugin automatically caches API responses for 24 hours to improve build performance. The cache is stored in `node_modules/.cache/ssg-routes.json`.

To disable caching:

```typescript
// In src/utils/ssg-routes.ts
const slugs = await getGuideSlugs({
  // ... other options
  cache: false,
})
```

To clear the cache, delete the file:

```bash
rm node_modules/.cache/ssg-routes.json
```

## Fallback Behavior

If the API request fails (network error, timeout, etc.), the plugin will automatically fall back to the mock API. This ensures builds don't fail if the API is temporarily unavailable.

## Programmatic Usage

You can also configure the plugin programmatically in `src/utils/ssg-routes.ts`:

```typescript
import { getGuideSlugs } from '../plugins/vite-plugin-ssg-dynamic-routes'

export async function getDynamicRoutes(): Promise<string[]> {
  const slugs = await getGuideSlugs({
    apiEndpoint: 'https://api.example.com/guides',
    apiMethod: 'GET',
    apiHeaders: {
      'Authorization': 'Bearer YOUR_TOKEN',
    },
    responsePath: 'data.guides',
    slugField: 'slug',
    timeout: 10000,
    cache: true,
  })

  return slugs.map(slug => `/guides/${slug}`)
}
```

## Testing

### Test API Configuration

1. Set the environment variables in `.env.development`
2. Run the build: `pnpm build`
3. Check the console output for API fetch status
4. Verify the generated routes in `dist/guides/`

### Test with Mock API

To test with mock API, simply don't set `VITE_GUIDES_API_ENDPOINT` or remove it from your `.env` file.

## Troubleshooting

### API Request Fails

- Check the API endpoint URL is correct
- Verify authentication headers are valid
- Check network connectivity
- Review API response format matches expected structure
- Check timeout value (increase if API is slow)

### No Routes Generated

- Verify the API returns data in the expected format
- Check the `responsePath` if using nested responses
- Verify the `slugField` matches your API response
- Check console logs for error messages

### Cache Issues

- Clear the cache: `rm node_modules/.cache/ssg-routes.json`
- Disable caching temporarily to test
- Check cache file permissions

## Security Notes

- Never commit API tokens or secrets to version control
- Use environment variables for sensitive data
- Consider using a build-time secret management solution
- Validate and sanitize API responses

