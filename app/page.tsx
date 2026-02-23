'use client';

import CityScanner from '@/components/3d/CityScanner';
import { CONTENT_SECTIONS } from '@/lib/contentData';
import { useScrollStore } from '@/lib/scrollStore';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

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

function FeatureTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-xs font-mono uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-glow inline-block" />
      {text}
    </span>
  );
}

function SectionDivider({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className={`h-px flex-1 max-w-[60px] transition-all duration-700 ${
        isActive ? 'bg-neon shadow-[0_0_6px_rgba(0,240,255,0.6)]' : 'bg-zinc-700'
      }`} />
      <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
        isActive ? 'bg-neon shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'bg-zinc-600'
      }`} />
      <div className={`h-px flex-1 max-w-[20px] transition-all duration-700 delay-100 ${
        isActive ? 'bg-neon/60' : 'bg-zinc-800'
      }`} />
    </div>
  );
}

function HeroSection({ section, isActive }: { 
  section: typeof CONTENT_SECTIONS[0]; 
  isActive: boolean;
}) {
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
      className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 py-20"
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
              <Link
                href={section.cta.href}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-mono font-semibold bg-neon text-void hover:bg-neon/90 hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] transition-all duration-200"
              >
                {section.cta.text}
                <span aria-hidden="true">→</span>
              </Link>
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

function ContentSection({ 
  section,
  isActive,
  index,
}: { 
  section: typeof CONTENT_SECTIONS[0];
  isActive: boolean;
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isGhost = section.id === 'ghost';
  const isInfra = section.id === 'infrastructure';

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
      className={`min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 py-20 transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className={`transition-all duration-500 transform ${
          isActive ? 'translate-y-0' : 'translate-y-4'
        }`}>
          <SectionDivider isActive={isActive} />

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
              <Link
                href={section.cta.href}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-mono font-semibold transition-all duration-200 ${
                  section.cta.variant === 'primary'
                    ? isInfra
                      ? 'bg-neon text-void hover:bg-neon/90 hover:shadow-[0_0_40px_rgba(0,240,255,0.5)]'
                      : 'bg-neon text-void hover:bg-neon/90 hover:shadow-[0_0_40px_rgba(0,240,255,0.5)]'
                    : section.cta.variant === 'secondary'
                    ? 'bg-zinc-800/60 text-zinc-100 hover:bg-zinc-700/60 border border-zinc-600/50 backdrop-blur-sm'
                    : 'bg-transparent text-zinc-300 hover:text-neon border border-zinc-700/30'
                }`}
              >
                {section.cta.text}
                <span aria-hidden="true">→</span>
              </Link>
            )}

            {isInfra && (
              <div className={`glass-card-strong px-5 py-3 rounded-lg text-sm font-mono text-zinc-400 flex items-center gap-2 transition-all duration-500 ${
                isActive ? 'border-glow-neon' : ''
              }`}>
                <span className="w-2 h-2 rounded-full bg-neon animate-pulse-glow" />
                System Online · {index + 1}/{CONTENT_SECTIONS.length} Nodes Active
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

function ScrollIndicator() {
  const currentStage = useScrollStore((state) => state.currentStage);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);

  const stages = ['Hero', 'Hunt', 'Audit', 'Ghost', 'Infrastructure'];
  const stageIndex = stages.indexOf(currentStage);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
      {stages.map((stage, i) => (
        <button
          key={stage}
          onClick={() => {
            const sectionId = CONTENT_SECTIONS[i].id;
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
          }}
          aria-label={`Go to ${stage} section`}
          className="group relative flex items-center justify-end gap-2"
        >
          <span className={`absolute right-5 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
            i === stageIndex 
              ? 'opacity-100 text-neon translate-x-0' 
              : 'opacity-0 group-hover:opacity-70 text-zinc-400 translate-x-2 group-hover:translate-x-0'
          }`}>
            {stage}
          </span>
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i === stageIndex 
              ? 'bg-neon shadow-[0_0_8px_rgba(0,240,255,0.8)] scale-125' 
              : i < stageIndex
              ? 'bg-zinc-500'
              : 'bg-zinc-700 group-hover:bg-zinc-500'
          }`} />
        </button>
      ))}
      <div className="mt-2 w-px h-8 bg-zinc-800 relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 right-0 bg-neon transition-all duration-300"
          style={{ height: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
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
            <div className="text-neon font-mono animate-pulse">Initializing Reactor...</div>
          </section>
        </main>
      </CityScanner>
    );
  }

  return (
    <CityScanner>
      <ScrollIndicator />
      <main className="w-full">
        {CONTENT_SECTIONS.map((section, index) => {
          const isActive = currentStage === section.stage;

          if (index === 0) {
            return (
              <HeroSection
                key={section.id}
                section={section}
                isActive={isActive}
              />
            );
          }

          return (
            <ContentSection
              key={section.id}
              section={section}
              isActive={isActive}
              index={index}
            />
          );
        })}
      </main>
    </CityScanner>
  );
}
