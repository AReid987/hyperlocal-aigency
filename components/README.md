# Components

## UI Components

### Button
A reusable button component with variants for different styles.

```tsx
import Button from '@/components/ui/Button';

<Button variant="primary">Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
```

## Layout Components

### ScrollSection
A wrapper component for scroll-based sections with alignment and z-index support.

```tsx
import ScrollSection from '@/components/layouts/ScrollSection';

<ScrollSection id="section-id" align="center" zIndex={10}>
  <h2>Section Title</h2>
  <p>Section content</p>
</ScrollSection>
```

## 3D Components
This directory is ready for React Three Fiber components in future iterations.
