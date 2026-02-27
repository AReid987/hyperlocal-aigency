# Void Reactor Deployment Guide

Complete guide for deploying the Void Reactor to production with Vercel, CI/CD automation, and performance monitoring.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Environment Configuration](#environment-configuration)
4. [Building for Production](#building-for-production)
5. [Vercel Deployment](#vercel-deployment)
6. [CI/CD with GitHub Actions](#cicd-with-github-actions)
7. [Performance Monitoring](#performance-monitoring)
8. [Testing Deployed Site](#testing-deployed-site)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)
11. [Rollback Strategy](#rollback-strategy)

---

## Prerequisites

### Required

- **Node.js** 18+ (we recommend 20 LTS)
- **npm** 9+
- **Git** for version control
- **GitHub** account for code hosting
- **Vercel** account (free tier available at [vercel.com](https://vercel.com))

### Optional

- **Sentry** account for error tracking (optional)
- **Google Analytics** account for analytics (optional)
- **Custom domain** with DNS management access

---

## Local Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd void-reactor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure variables:

```bash
# Application URL (local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Enable/disable features
NEXT_PUBLIC_SHOW_FPS_MONITOR=true  # Only in development
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_WEB_VITALS=true

# Sentry (optional - leave blank if not using)
# NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL of the application | `https://yourdomain.com` |
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment name | `production` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SHOW_FPS_MONITOR` | Show FPS monitor in dev | `false` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |
| `NEXT_PUBLIC_ENABLE_WEB_VITALS` | Track Web Vitals | `true` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | - |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 ID | - |

### Setting Up Sentry (Optional)

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project (Next.js)
3. Copy your DSN
4. Add to `.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

---

## Building for Production

### 1. Run Type Check

```bash
npm run type-check
```

This checks for TypeScript errors without building.

### 2. Run Linter

```bash
npm run lint
```

This runs ESLint to ensure code quality.

### 3. Build Application

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### 4. Analyze Bundle Size (Optional)

```bash
npm run analyze
```

This opens a bundle analyzer showing the size of each package.

**Target Metrics:**
- Main bundle: < 500KB gzipped
- Total page weight: < 2MB
- First Load JS: < 200KB

### 5. Test Production Build Locally

```bash
npm start
```

This runs the production build locally on http://localhost:3000.

---

## Vercel Deployment

### Option 1: One-Click Deploy (Recommended for First Deployment)

#### Step 1: Link GitHub Repository

1. Go to [Vercel](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Select your GitHub repository
4. Vercel will automatically detect Next.js

#### Step 2: Configure Project

**Framework Preset:** Next.js

**Build & Development Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

#### Step 3: Set Environment Variables

Go to **Settings** → **Environment Variables** and add:

```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SHOW_FPS_MONITOR=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true  # If using analytics
NEXT_PUBLIC_SENTRY_DSN=your-dsn    # If using Sentry
```

**Important:** Add variables for all three environments:
- **Development** (for local dev)
- **Preview** (for pull requests)
- **Production** (for main branch)

#### Step 4: Deploy

Click **Deploy**. Vercel will build and deploy your application.

The deployment URL will be: `https://your-project-name.vercel.app`

### Option 2: Vercel CLI (Alternative)

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Login

```bash
vercel login
```

#### Deploy

```bash
vercel
```

Follow the prompts to configure your project.

#### Production Deployment

```bash
vercel --prod
```

---

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `voidreactor.com`)

### Step 2: Update DNS Records

Vercel will show you the DNS records to add:

**For Apex Domain (e.g., voidreactor.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For Subdomain (e.g., www.voidreactor.com):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### Step 3: Wait for Propagation

DNS propagation can take up to 24 hours (usually 5-30 minutes).

### Step 4: Enable Automatic HTTPS

Vercel automatically provisions SSL certificates. Just wait for the green lock to appear.

---

## CI/CD with GitHub Actions

### Required GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add the following secrets:

| Secret | Value | How to Get |
|--------|-------|------------|
| `VERCEL_TOKEN` | Vercel access token | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Organization ID | Run `vercel link` locally |
| `VERCEL_PROJECT_ID` | Project ID | Run `vercel link` locally |

### Getting Vercel Credentials

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel link`
3. Follow the prompts to link your project
4. Open `.vercel/project.json` to find IDs:

```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

### Creating Vercel Access Token

1. Go to [Vercel Settings → Tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Give it a name (e.g., "GitHub Actions")
4. Scope: **Full Account**
5. Copy the token and add to GitHub secrets

### CI/CD Workflow

The workflow (`.github/workflows/deploy.yml`) automatically:

1. **On Push:** Runs linting, type-checking, and builds
2. **On Pull Request:** Creates preview deployment
3. **On Main Branch:** Deploys to production

### Lighthouse CI

Lighthouse runs automatically on pull requests and main branch deployments, checking:

- Performance score (> 85)
- Accessibility score (> 90)
- Best Practices score (> 90)
- SEO score (> 90)

Results are posted as comments on pull requests.

---

## Performance Monitoring

### Web Vitals

The application automatically tracks:

- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 800ms

Metrics are:
- Logged to console in development
- Sent to analytics if `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- Sent to `/api/vitals` endpoint if `NEXT_PUBLIC_ENABLE_WEB_VITALS=true`

### Performance Monitor (Development Only)

Enable FPS monitor in development:

```bash
NEXT_PUBLIC_SHOW_FPS_MONITOR=true
```

This displays:
- Current FPS
- Memory usage (Chrome only)
- Scroll progress
- Current stage
- Viewport size
- Connection type

### Sentry Error Tracking (Optional)

If configured, Sentry automatically captures:

- JavaScript errors
- React component errors
- Performance issues
- User interactions

View errors at: `https://sentry.io/organizations/YOUR-ORG/projects/YOUR-PROJECT/`

---

## Testing Deployed Site

### 1. Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Scroll interactions work smoothly
- [ ] 3D canvas renders without errors
- [ ] Mobile responsiveness (test on actual device)
- [ ] All links work
- [ ] No console errors (check DevTools)
- [ ] Performance monitor (if enabled) shows good FPS
- [ ] Analytics and error tracking initialize (if configured)

### 2. Performance Testing

#### Run Lighthouse

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select categories: Performance, Accessibility, Best Practices, SEO
4. Click **Analyze page load**

**Target Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

#### Run WebPageTest

Visit [webpagetest.org](https://www.webpagetest.org):

1. Enter your URL
2. Test from: "Dulles, VA" (or nearest location)
3. Browser: Chrome
4. Connection: 4G
5. Run Test

**Target Metrics:**
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- TTI: < 3.8s
- Speed Index: < 3.4s

### 3. Cross-Browser Testing

Test on:
- Chrome (desktop & mobile)
- Firefox (desktop)
- Safari (iOS & macOS)
- Edge (desktop)

Use tools like [BrowserStack](https://www.browserstack.com) or [LambdaTest](https://www.lambdatest.com) if needed.

### 4. Mobile Testing

- Test on iPhone and Android
- Check portrait and landscape orientations
- Test slow 3G connection (Chrome DevTools → Network → Throttling)
- Test touch gestures (scroll, zoom)

---

## Monitoring & Maintenance

### Daily/Weekly Tasks

- Check Sentry for new errors (if configured)
- Review Vercel deployment logs
- Monitor Web Vitals in Vercel Analytics

### Monthly Tasks

- Run `npm audit` to check for security vulnerabilities
- Review Lighthouse scores
- Update dependencies: `npm update`
- Test on new browser versions

### Quarterly Tasks

- Review and optimize bundle size
- Review and update analytics goals
- Review error tracking dashboards
- Plan new features and improvements

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies (interactive)
npx npm-check-updates -u

# Install updates
npm install

# Test everything works
npm run type-check
npm run lint
npm run build
npm start
```

---

## Troubleshooting

### Build Failures

#### Issue: "Module not found" error

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Issue: TypeScript errors

**Solution:**
```bash
npm run type-check
# Fix reported errors
npm run build
```

#### Issue: "Out of memory" during build

**Solution:**
Increase Node.js memory limit:

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### 3D Rendering Issues

#### Issue: Canvas not rendering

**Solutions:**
1. Check browser console for WebGL errors
2. Verify GPU acceleration is enabled in browser settings
3. Try clearing browser cache
4. Test on different browser

#### Issue: Poor performance on mobile

**Solutions:**
1. Reduce number of buildings in CityScanner
2. Disable bloom effect: `NEXT_PUBLIC_ENABLE_BLOOM=false`
3. Increase frame skip: `NEXT_PUBLIC_FRAME_SKIP=3`

### Deployment Failures

#### Issue: "Build timed out"

**Solution:**
- Optimize build (remove unnecessary dependencies)
- Check Vercel function logs for errors
- Split heavy operations into multiple steps

#### Issue: "Deployment successful but site not loading"

**Solutions:**
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Clear browser cache
4. Check DNS propagation (if using custom domain)

#### Issue: "Environment variables not working"

**Solution:**
- Ensure variables are added in Vercel dashboard (not just `.env.local`)
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables
- Variables must start with `NEXT_PUBLIC_` to be available in browser

### Performance Issues

#### Issue: Slow initial load

**Solutions:**
1. Run bundle analyzer: `npm run analyze`
2. Remove unused dependencies
3. Use dynamic imports for heavy components
4. Enable compression (already configured)
5. Review Lighthouse recommendations

#### Issue: Low FPS on scroll

**Solutions:**
1. Check FPS monitor for bottlenecks
2. Reduce 3D scene complexity
3. Optimize render frequency (increase `FRAME_SKIP`)
4. Use requestAnimationFrame for smooth animations

#### Issue: Large bundle size

**Solutions:**
1. Run `npm run analyze`
2. Identify large packages
3. Consider tree-shaking alternatives
4. Lazy load routes with dynamic imports
5. Use `next/image` for optimized images

---

## Rollback Strategy

### Automatic Rollback

Vercel maintains up to 6 production deployments by default. You can revert at any time:

1. Go to **Deployments** tab in Vercel
2. Find the previous successful deployment
3. Click **...** → **Promote to Production**

### Manual Rollback via CLI

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Rollback via Git

1. Revert the problematic commit:

```bash
git revert <commit-hash>
git push origin main
```

2. CI/CD will automatically deploy the reverted version

### Emergency Rollback

If site is completely broken:

1. Go to Vercel → Deployments
2. Click on a known-good deployment
3. Click **Promote to Production**
4. This happens immediately without building

### Database/Data Rollback (if applicable)

If your application uses a database:

1. Keep database backups
2. Document schema changes
3. Use migrations for schema updates
4. Test rollback procedures regularly

---

## Additional Resources

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Sentry Documentation](https://docs.sentry.io)
- [Web Vitals](https://web.dev/vitals/)

### Community & Support

- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Vercel Discord](https://vercel.com/discord)
- [R3F Discord](https://discord.gg/poimandres)

### Performance Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with:
   - Error messages
   - Steps to reproduce
   - Environment details (Node.js version, browser, etc.)
   - Screenshots if applicable

---

**Last Updated:** 2025-01-26
