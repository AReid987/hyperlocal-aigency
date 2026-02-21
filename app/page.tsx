'use client';

import CityScanner from '@/components/3d/CityScanner';
import { CONTENT_SECTIONS } from '@/lib/contentData';
import { useScrollStore } from '@/lib/scrollStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="text-2xl sm:text-3xl font-mono font-bold text-neon mb-1">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

function ContentSection({ 
  id, 
  title, 
  subtitle, 
  description, 
  stats, 
  cta,
  isActive 
}: { 
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  stats?: { value: string; label: string }[];
  cta?: { text: string; href: string; variant: 'primary' | 'secondary' | 'ghost' };
  isActive: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      id={id}
      className={`min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 py-20 transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className={`transition-all duration-500 transform ${
          isActive ? 'translate-y-0' : 'translate-y-4'
        }`}>
          {/* Active indicator */}
          <div className={`h-1 w-20 mx-auto mb-8 transition-all duration-300 ${
            isActive ? 'bg-neon shadow-[0_0_10px_rgba(0,240,255,0.8)]' : 'bg-zinc-700'
          }`} />
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-neon text-sm sm:text-base uppercase tracking-[0.2em] mb-3 font-mono">
              {subtitle}
            </p>
          )}
          
          {/* Title */}
          <h2 className={`text-4xl sm:text-5xl lg:text-6xl mb-6 font-mono font-bold transition-colors duration-300 ${
            isActive ? 'text-zinc-100' : 'text-zinc-400'
          }`}>
            {title}
          </h2>
          
          {/* Description */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mb-8 leading-relaxed">
            {description}
          </p>
          
          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-xl">
              {stats.map((stat, index) => (
                <StatCard key={index} value={stat.value} label={stat.label} />
              ))}
            </div>
          )}
          
          {/* CTA */}
          {cta && (
            <Link 
              href={cta.href}
              className={`inline-block px-8 py-4 rounded-lg font-mono font-semibold transition-all duration-200 ${
                cta.variant === 'primary'
                  ? 'bg-neon text-void hover:bg-neon/90 hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]'
                  : cta.variant === 'secondary'
                  ? 'bg-zinc-800/60 text-zinc-100 hover:bg-zinc-700/60 border border-zinc-600/50 backdrop-blur-sm'
                  : 'bg-transparent text-zinc-300 hover:text-neon border border-zinc-700/30'
              }`}
            >
              {cta.text}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const currentStage = useScrollStore((state) => state.currentStage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <CityScanner>
        <main className="w-full">
          <section className="min-h-screen flex items-center justify-center">
            <div className="text-neon">Loading...</div>
          </section>
        </main>
      </CityScanner>
    );
  }

  return (
    <CityScanner>
      <main className="w-full">
        {CONTENT_SECTIONS.map((section) => (
          <ContentSection
            key={section.id}
            {...section}
            isActive={currentStage === section.title}
          />
        ))}
      </main>
    </CityScanner>
  );
}
