import Button from '@/components/ui/Button';
import ScrollSection from '@/components/layouts/ScrollSection';

export default function TestPage() {
  return (
    <main className="relative w-full">
      <ScrollSection id="test-section-1" align="center">
        <h1 className="text-5xl mb-6 text-neon">Component Test Page</h1>
        <p className="text-lg text-zinc-300 mb-8">
          Testing Button and ScrollSection components
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
        </div>
      </ScrollSection>

      <ScrollSection id="test-section-2" align="left" className="glass-card max-w-4xl mx-auto p-8">
        <h2 className="text-3xl mb-4">Glass Card Example</h2>
        <p className="text-zinc-400">
          This section demonstrates the glassmorphism effect with left alignment.
        </p>
      </ScrollSection>

      <ScrollSection id="test-section-3" align="right">
        <h2 className="text-3xl mb-4">Right Aligned Section</h2>
        <p className="text-zinc-400 max-w-2xl">
          Components are working correctly with custom styling and typography.
        </p>
      </ScrollSection>
    </main>
  );
}
