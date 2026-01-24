# The Void Reactor - Scrollytelling MVP

A Next.js 14 application built for creating immersive scrollytelling experiences with custom typography and dark aesthetics.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Typography**: JetBrains Mono (code/headers) + Inter (body)
- **Language**: TypeScript (strict mode)

## 🎨 Design System

### Color Palette
- `void`: `#09090b` (Zinc 950 - background)
- `neon`: `#00f0ff` (Cyan - active/targets)
- `danger`: `#f43f5e` (Rose - disqualified)
- `zinc`: Full Tailwind zinc scale (50-950)

### Typography
- **Headers**: JetBrains Mono (monospace)
- **Body**: Inter (sans-serif)

### Custom Utilities
- `.glass-card`: Glassmorphism effect (40% opacity, 12px blur)
- `.glass-card-strong`: Stronger glassmorphism (60% opacity, 16px blur)

## 📁 Project Structure

```
project/
├── app/
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Main scrollytelling page (5 sections)
│   ├── globals.css        # Global styles & utilities
│   └── test/              # Component test page
├── components/
│   ├── ui/
│   │   └── Button.tsx     # Reusable button component
│   ├── layouts/
│   │   └── ScrollSection.tsx  # Scroll section wrapper
│   └── 3d/                # (Ready for R3F components)
├── lib/
│   └── constants.ts       # App constants
└── public/                # Static assets
```

## 🏃 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production
```bash
npm run build
npm start
```

## 📄 Scroll Sections

The main page (`/app/page.tsx`) contains 5 scroll sections:

1. **Hero** (`#hero`) - Introduction
2. **Hunt** (`#hunt`) - Target acquisition
3. **Audit** (`#audit`) - Verification protocols
4. **Ghost** (`#ghost`) - Disqualification cascade
5. **Infrastructure** (`#infrastructure`) - System architecture

## 🧩 Components

### Button
```tsx
import Button from '@/components/ui/Button';

<Button variant="primary">Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
```

### ScrollSection
```tsx
import ScrollSection from '@/components/layouts/ScrollSection';

<ScrollSection id="section-id" align="center" zIndex={10}>
  <h2>Section Title</h2>
  <p>Content</p>
</ScrollSection>
```

## 🎯 Next Steps

- Integrate React Three Fiber for 3D visualizations
- Add scroll-based animations
- Implement interactive data visualizations
- Add API integrations

## 📝 License

MIT
