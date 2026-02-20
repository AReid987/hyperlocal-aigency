# Void Reactor Deployment Guide

This guide covers deploying the Void Reactor to Vercel with automatic CI/CD.

## Prerequisites

- Node.js 20+
- Vercel account
- GitHub repository

## Quick Deploy

### Option 1: One-Click Deploy

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in required values:
   ```
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```
3. For production, add variables in Vercel dashboard:
   - Go to Settings → Environment Variables
   - Add each variable

## CI/CD Setup

The repository includes automatic deployment via GitHub Actions:

1. **Secrets Required** (in GitHub repo Settings → Secrets):
   - `VERCEL_TOKEN` - Vercel access token
   - `VERCEL_ORG_ID` - Vercel organization ID
   - `VERCEL_PROJECT_ID` - Vercel project ID

2. **Getting Vercel Credentials**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Link project
   vercel link
   
   # Get Organization and Project IDs
   cat .vercel/project.json
   ```

3. **Create Access Token**:
   - Go to Vercel → Settings → Tokens
   - Create new token with "Full Account" scope

## Deployment Flow

### Pull Requests
- Automatic preview deployment
- Commented with preview URL

### Main Branch
- Automatic production deployment
- Available at your Vercel domain

## Post-Deployment Checklist

- [ ] Verify homepage loads
- [ ] Test scroll interactions
- [ ] Check 3D canvas renders
- [ ] Verify mobile responsiveness
- [ ] Run Lighthouse audit:
  - Performance > 90
  - Accessibility > 90
  - Best Practices > 90
  - SEO > 90

## Troubleshooting

### Build Failures
- Check Node.js version matches (20+)
- Ensure all dependencies are in package.json
- Run `npm run build` locally first

### 3D Rendering Issues
- Verify WebGL support
- Check browser console for errors
- Try clearing browser cache

### Performance
- Run `npm run build` and check output
- Verify no bundle size warnings
- Check Vercel function logs

## Custom Domain

1. Go to Vercel → Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for propagation (can take up to 24h)

## Analytics & Monitoring

Optional integrations:

### Vercel Analytics
- Built-in, no config needed
- Available in dashboard

### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
```

Add to `next.config.mjs`:
```js
const nextConfig = {
  sentry: {
    hideSourceMaps: true,
  },
};
```

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Issue Tracker: Create GitHub issue
