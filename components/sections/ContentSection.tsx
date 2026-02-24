'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { SectionContent } from '@/lib/contentData';
import Button from '@/components/ui/Button';

interface ContentSectionProps {
  section: SectionContent;
  isActive: boolean;
  index: number;
}

function SectionDivider({ isActive, accentColor }: { isActive: boolean; accentColor: 'neon' | 'danger' | 'neutral' }) {
  const activeClass = accentColor === 'danger' 
    ? 'bg-danger shadow-[0_0_6px_rgba(244,63,94,0.6)]' 
    : 'bg-neon shadow-[0_0_6px_rgba(0,240,255,0.6)]';
  const inactiveClass = 'bg-zinc-700';
  const dotActiveClass = accentColor === 'danger'
    ? 'bg-danger shadow-[0_0_8px_rgba(244,63,94,0.8)]'
    : 'bg-neon shadow-[0_0_8px_rgba(0,240,255,0.8)]';

  return (
    <div className="flex items-center gap-3 mb-8">
      <div className={`h-px flex-1 max-w-[60px] transition-all duration-700 ${
        isActive ? activeClass : inactiveClass
      }`} />
      <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
        isActive ? dotActiveClass : 'bg-zinc-600'
      }`} />
      <div className={`h-px flex-1 max-w-[20px] transition-all duration-700 delay-100 ${
        isActive ? (accentColor === 'danger' ? 'bg-danger/60' : 'bg-neon/60') : 'bg-zinc-800'
      }`} />
    </div>
  );
}

function StatCard({ value, label, isActive, accentColor = 'neon' }: { 
  value: string; 
  label: string; 
  isActive: boolean;
  accentColor?: 'neon' | 'danger';
}) {
  return (
    <div className={`glass-card p-4 text-center transition-all duration-500 ${
      isActive 
        ? accentColor === 'danger' 
          ? 'glass-card-danger danger-glow' 
          : 'glass-card-neon neon-glow' 
        : ''
    }`}>
      <div className={`text-2xl sm:text-3xl font-mono font-bold mb-1 transition-all duration-300 ${
        accentColor === 'danger' ? 'text-danger' : 'text-neon'
      } ${isActive ? accentColor === 'danger' ? 'text-glow-danger' : 'text-glow-neon' : ''}`}>
        {value}
      </div>
      <div className="text-xs sm:text-sm text-zinc-400 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export default function ContentSection({ section, isActive, index }: ContentSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isGhost = section.id === 'ghost';
  const isInfra = section.id === 'infrastructure';
  const accentColor = section.color === 'danger' ? 'danger' : 'neon';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={section.id}
      className={`min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 py-20 transition-opacity duration-700 relative z-10 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className={`transition-all duration-500 transform ${
          isActive ? 'translate-y-0' : 'translate-y-4'
        }`}>
          <SectionDivider isActive={isActive} accentColor={section.color} />

          {section.subtitle && (
            <p className={`text-sm sm:text-base uppercase tracking-[0.2em] mb-3 font-mono transition-colors duration-300 ${
              isGhost ? 'text-danger' : 'text-neon'
            }`}>
              {section.subtitle}
            </p>
          )}

          <h2 className={`text-4xl sm:text-5xl lg:text-6xl mb-6 font-mono font-bold transition-all duration-300 ${
            isActive 
              ? isGhost 
                ? 'text-zinc-100 text-glow-danger' 
                : 'text-zinc-100 text-glow-neon' 
              : 'text-zinc-400'
          }`}>
            {section.title}
          </h2>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mb-8 leading-relaxed">
            {section.description}
          </p>

          {section.stats && section.stats.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-xl">
              {section.stats.map((stat, i) => (
                <StatCard
                  key={i}
                  value={stat.value}
                  label={stat.label}
                  isActive={isActive}
                  accentColor={isGhost ? 'danger' : 'neon'}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4 items-center">
            {section.cta && (
              <Button
                variant={section.cta.variant}
                className="inline-flex items-center gap-2 px-8 py-4"
                accentColor={accentColor}
                asChild
              >
                <Link href={section.cta.href}>
                  {section.cta.text}
                  <span aria-hidden="true">→</span>
                </Link>
              </Button>
            )}

            {isInfra && (
              <div className={`glass-card-strong px-5 py-3 rounded-lg text-sm font-mono text-zinc-400 flex items-center gap-2 transition-all duration-500 ${
                isActive ? 'border-glow-neon' : ''
              }`}>
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse-glow" />
                System Online · {index + 1}/5 Nodes Active
              </div>
            )}
          </div>

          {isInfra && (
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {['Cloud Infrastructure', 'Edge Networks', 'AI Pipelines', 'Data Mesh'].map((item) => (
                <div key={item} className={`glass-card p-3 text-center text-xs font-mono text-zinc-400 uppercase tracking-wider transition-all duration-500 ${
                  isActive ? 'animate-border-pulse' : ''
                }`}>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
