'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { SectionContent } from '@/lib/contentData';
import Button from '@/components/ui/Button';

interface HeroSectionProps {
  section: SectionContent;
  isActive: boolean;
}

function StatCard({ value, label, isActive }: { 
  value: string; 
  label: string; 
  isActive: boolean;
}) {
  return (
    <div className={`glass-card p-4 text-center transition-all duration-500 ${
      isActive ? 'glass-card-neon neon-glow' : ''
    }`}>
      <div className={`text-2xl sm:text-3xl font-mono font-bold mb-1 transition-all duration-300 ${
        isActive ? 'text-neon text-glow-neon' : 'text-zinc-400'
      }`}>
        {value}
      </div>
      <div className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

function FeatureTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-xs font-mono uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-glow inline-block" />
      {text}
    </span>
  );
}

export default function HeroSection({ section, isActive }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={section.id}
      className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 py-20 relative z-10"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {section.subtitle && (
            <p className="text-neon text-sm sm:text-base uppercase tracking-[0.3em] mb-4 font-mono animate-flicker">
              ◈ {section.subtitle}
            </p>
          )}

          <h1 className={`text-5xl sm:text-7xl lg:text-8xl mb-6 font-mono font-bold leading-none transition-colors duration-500 ${
            isActive ? 'text-zinc-100 text-glow-neon' : 'text-zinc-200'
          }`}>
            {section.title}
          </h1>

          <div className="relative max-w-2xl mb-10">
            <div className={`absolute -left-4 top-0 bottom-0 w-0.5 transition-all duration-700 ${
              isActive ? 'bg-neon shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'bg-zinc-700'
            }`} />
            <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed pl-4">
              {section.description}
            </p>
          </div>

          {section.stats && section.stats.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 max-w-lg">
              {section.stats.map((stat, index) => (
                <StatCard key={index} value={stat.value} label={stat.label} isActive={isActive} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4 items-center">
            {section.cta && (
              <Button
                variant={section.cta.variant}
                className="inline-flex items-center gap-2 px-8 py-4"
                asChild
              >
                <Link href={section.cta.href}>
                  {section.cta.text}
                  <span aria-hidden="true">→</span>
                </Link>
              </Button>
            )}
            <div className="flex flex-wrap gap-2">
              <FeatureTag text="AI-Powered" />
              <FeatureTag text="Real-Time" />
              <FeatureTag text="Zero-Trust" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
