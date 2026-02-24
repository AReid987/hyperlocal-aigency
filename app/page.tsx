'use client';

import CityScanner from '@/components/3d/CityScanner';
import HeroSection from '@/components/sections/HeroSection';
import ContentSection from '@/components/sections/ContentSection';
import { CONTENT_SECTIONS } from '@/lib/contentData';
import { useScrollStore } from '@/lib/scrollStore';
import { useEffect, useState } from 'react';

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
          <section className="min-h-screen flex items-center justify-center relative z-10">
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
