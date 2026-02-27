# The Void Reactor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/void-reactor/deploy.yml?branch=main)](https://github.com/your-username/void-reactor/actions)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-brightgreen)](https://voidreactor.hyperlocal.aigency)

Navigate the digital void. Autonomous infrastructure discovery, real-time verification, and AI-powered system mapping at the edge of what's possible.

## 🚀 Features

- **Immersive 3D Experience** - Interactive WebGL city visualization with React Three Fiber
- **Scrollytelling** - 5-stage narrative journey through the digital infrastructure
- **Performance Optimized** - < 2.5s LCP, optimized bundle sizes, frame rate limiting
- **Type-Safe** - Full TypeScript coverage with strict mode enabled
- **Production Ready** - Complete CI/CD pipeline with GitHub Actions and Vercel
- **Error Tracking** - Sentry integration for production monitoring
- **Analytics** - Web Vitals tracking and performance monitoring
- **SEO Optimized** - Open Graph tags, sitemap, robots.txt, and structured data

## 🎨 Tech Stack

### Core Framework
- **Next.js 14** (App Router) - React framework for production
- **React 18** - UI library
- **TypeScript 5** - Type-safe JavaScript

### Styling & Design
- **Tailwind CSS** - Utility-first CSS framework
- **JetBrains Mono** - Monospace font for headers and code
- **Inter** - Clean sans-serif for body text

### 3D Graphics
- **Three.js** - WebGL 3D library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **React Three Postprocessing** - Post-processing effects (bloom, etc.)

### State Management
- **Zustand** - Lightweight state management for scroll state

### Development & Deployment
- **Vercel** - Deployment platform
- **GitHub Actions** - CI/CD automation
- **Lighthouse CI** - Performance regression testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Sentry** - Error tracking (optional)

### Monitoring & Analytics
- **Web Vitals** - Core performance metrics tracking
- **Bundle Analyzer** - Bundle size optimization
- **Performance Monitor** - FPS and memory tracking (dev only)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/void-reactor.git
cd void-reactor

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏃 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build & Test
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type check

# Analysis & Debugging
npm run analyze          # Analyze bundle size (ANALYZE=true npm run build)

# Formatting
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## 🎯 Project Structure

```
void-reactor/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with fonts & metadata
│   ├── page.tsx                 # Main application page
│   └── globals.css              # Global styles & Tailwind
│
├── components/                   # React components
│   ├── 3d/                      # 3D components (R3F)
│   │   ├── CityScanner.tsx      # Main 3D city with 625 buildings
│   │   ├── BuildingsGrid.tsx    # Building grid component
│   │   ├── BloomEffect.tsx      # Bloom post-processing
│   │   ├── ParticleFlow.tsx     # Particle effects
│   │   └── GlowingNetwork.tsx   # Network visualization
│   ├── dev/                     # Development-only components
│   │   └── PerformanceMonitor.tsx  # FPS & performance monitor
│   ├── layouts/                 # Layout components
│   │   └── ScrollSection.tsx   # Scroll section wrapper
│   ├── sections/                # Page sections
│   │   └── Hero.tsx             # Hero section component
│   └── ui/                      # UI components
│       └── Button.tsx           # Reusable button
│
├── lib/                          # Utilities & libraries
│   ├── constants.ts             # App constants
│   ├── contentData.ts           # Section content data
│   ├── scrollStore.ts           # Zustand store for scroll state
│   ├── performanceUtils.ts      # Performance utilities
│   ├── vitals.ts                # Web Vitals tracking
│   └── errorTracking.ts         # Sentry error tracking
│
├── public/                       # Static assets
│   ├── sitemap.xml              # SEO sitemap
│   └── robots.txt               # Search engine rules
│
├── .github/                      # GitHub configuration
│   └── workflows/
│       └── deploy.yml            # CI/CD pipeline
│
├── .github/
│   └── lighthouse-budget.json   # Lighthouse performance budgets
│
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── vercel.json                  # Vercel deployment config
├── package.json                 # Dependencies and scripts
├── .env.local.example           # Environment variables template
├── .prettierrc                  # Prettier configuration
├── .eslintrc.json               # ESLint configuration
├── DEPLOYMENT.md                # Comprehensive deployment guide
└── README.md                    # This file
```

## 🎨 Design System

### Color Palette

| Name | Value | Usage |
|------|-------|-------|
| `void` | `#09090b` (Zinc 950) | Background |
| `neon` | `#00f0ff` (Cyan) | Primary accent, active states |
| `danger` | `#f43f5e` (Rose) | Error states, disqualification |
| `zinc` | 50-950 scale | Grayscale, borders, text |

### Typography

- **Headers:** JetBrains Mono (monospace)
- **Body:** Inter (sans-serif)
- **Weights:** 300-700 available
- **Display:** Optimized for swap loading

### Custom Utilities

```css
.glass-card          /* 40% opacity glassmorphism with 12px blur */
.glass-card-strong   /* 60% opacity glassmorphism with 16px blur */
```

## 🌐 Deployment

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Features
NEXT_PUBLIC_SHOW_FPS_MONITOR=true  # Dev only
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_WEB_VITALS=true

# Sentry (optional)
# NEXT_PUBLIC_SENTRY_DSN=your-dsn
```

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

- ✅ Runs ESLint on every push
- ✅ Runs TypeScript type checking
- ✅ Builds the application
- ✅ Runs Lighthouse CI for performance testing
- ✅ Deploys preview URLs for pull requests
- ✅ Deploys to production on main branch pushes
- ✅ Posts Lighthouse results as PR comments

## 📊 Performance

### Target Metrics

- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 800ms

### Optimization Techniques

- Bundle code splitting for 3D libraries
- Image optimization with WebP/AVIF formats
- Frame rate limiting for smooth animations
- Compression with gzip/brotli
- Static asset caching (31 days)
- Tree shaking for unused code
- Dynamic imports for heavy components

### Bundle Size

Run `npm run analyze` to view bundle sizes:

```bash
ANALYZE=true npm run build
```

**Targets:**
- Main bundle: < 500KB gzipped
- Total page weight: < 2MB
- First Load JS: < 200KB

## 🔧 Configuration

### Next.js Config (`next.config.mjs`)

- Image optimization (WebP, AVIF)
- Package imports optimization for Three.js
- Security headers (HSTS, CSP, etc.)
- Sentry integration
- Bundle analyzer support

### Tailwind Config (`tailwind.config.ts`)

- Custom color palette
- Font family configuration
- Custom utilities (glass-card, etc.)
- Dark mode support

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path aliases (`@/*` → root)
- Next.js plugin integration
- ES2020 target

## 🧪 Development

### Adding New Scroll Sections

1. Create content in `lib/contentData.ts`
2. Add section component in `components/sections/`
3. Import and render in `app/page.tsx`
4. Update stage detection in `lib/scrollStore.ts`

### Creating 3D Components

```tsx
'use client';
import { Canvas } from '@react-three/fiber';

export default function My3DComponent() {
  return (
    <Canvas>
      {/* Your 3D content */}
    </Canvas>
  );
}
```

### Adding Analytics

Configure in `.env.local`:

```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX  # Optional
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx  # Optional
```

### Enabling Error Tracking

Configure in `.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Examples](https://threejs.org/examples/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

## 🐛 Troubleshooting

For common issues and solutions, see [DEPLOYMENT.md - Troubleshooting Section](DEPLOYMENT.md#troubleshooting).

### Common Issues

**Build fails with "Module not found":**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Canvas not rendering:**
- Check browser console for WebGL errors
- Verify GPU acceleration is enabled
- Test on different browser

**Performance issues:**
- Run `npm run analyze` to check bundle size
- Reduce 3D scene complexity
- Increase `NEXT_PUBLIC_FRAME_SKIP` value

## 📧 Support

- Create an issue on GitHub for bugs or questions
- Check existing issues for solutions
- Join our Discord community (if available)

---

**Built with ❤️ by [Hyperlocal.Aigency](https://hyperlocal.aigency)**
