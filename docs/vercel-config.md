# Vercel Configuration for Agent Sync

This document provides details on how the Agent Sync project is configured for Vercel deployment.

## Configuration Files

The Vercel deployment configuration is managed through two main files:

1. **vercel.json** - Contains Vercel-specific deployment settings
2. **next.config.js** - Contains Next.js build configuration

## vercel.json Settings

```json
{
  "github": {
    "silent": true
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "Cross-Origin-Resource-Policy",
          "value": "same-origin"
        }
      ]
    }
  ],
  "buildCommand": "TAURI_BUILD=true npm run build",
  "outputDirectory": "out"
}
```

### Key Settings

- **GitHub Integration**: Silent mode is enabled to prevent excessive notifications
- **Rewrites**: All routes are redirected to index.html for SPA handling
- **Headers**: Security headers are configured for all routes
- **Build Command**: Uses `TAURI_BUILD=true npm run build` to generate static exports
- **Output Directory**: Artifacts are placed in the `out` directory

## Build Configuration in next.config.js

The Next.js configuration file includes special handling for Tauri builds:

```javascript
// When TAURI_BUILD=true is set
{
  output: 'export', // Static export for Tauri
  distDir: 'out',   // Output directory for Tauri
  images: {
    unoptimized: true, // Required for static export
  }
}
```

## Deployment Process

1. The Vercel CLI executes the build command specified in vercel.json
2. The TAURI_BUILD environment variable triggers the static export configuration in next.config.js
3. Next.js generates static HTML files in the `out` directory
4. Vercel deploys these static files to its CDN

## Common Issues and Solutions

### Memory Limitations

Memory issues during build can be addressed by:
- Using the `--max-old-space-size` Node.js option (already configured in package.json)
- Optimizing webpack configuration (implemented in next.config.js)

### Path Resolution

The rewrite rule in vercel.json ensures client-side routing works properly by redirecting all paths to index.html.

### Environment Variables

Ensure all required environment variables are configured in the Vercel project settings before deployment.

## Troubleshooting Deployment Failures

If deployment fails:

1. Check Vercel logs for specific error messages
2. Verify the local build works with `TAURI_BUILD=true npm run build`
3. Ensure all dependencies in package.json are correctly specified
4. Check for Node.js version compatibility issues

### Handling Local File Dependencies

The project uses local file dependencies (from `../shared-tools/packages/*`), which cause issues with Vercel deployment since Vercel doesn't have access to these local paths.

To resolve this issue, use the automated deployment script:

```bash
# This script handles everything automatically
npm run vercel:deploy
```

This script will:
1. Create a Vercel-compatible version of package.json that replaces local file dependencies
2. Deploy to Vercel with the modified package.json
3. Restore your original package.json after deployment

#### Manual Process

If you need to troubleshoot or manually deploy:

1. Run the preparation script:
   ```bash
   npm run vercel:prepare
   ```

2. This creates `package.vercel.json` with local dependencies replaced

3. Replace package.json with the Vercel-compatible version:
   ```bash
   cp package.vercel.json package.json
   ```

4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

5. Restore your original package.json:
   ```bash
   git checkout -- package.json
   ```