'use client';

import React, { useEffect, useState, useRef } from 'react';

type ScrollSectionVariant = 'hero' | 'content' | 'minimal';
type GlowVariant = 'none' | 'subtle' | 'moderate' | 'intense';

interface ScrollSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  zIndex?: number;
  variant?: ScrollSectionVariant;
  accentColor?: 'neon' | 'danger' | 'neutral';
  sticky?: boolean;
  glowIntensity?: GlowVariant;
  borderGlow?: boolean;
}

function getGlowStyles(accentColor: 'neon' | 'danger' | 'neutral', intensity: GlowVariant): string {
  if (intensity === 'none' || accentColor === 'neutral') return '';
  
  const color = accentColor === 'danger' 
    ? { r: 244, g: 63, b: 94 }
    : { r: 0, g: 240, b: 255 };
  
  const intensities: Record<GlowVariant, { shadow: string; opacity: number }> = {
    none: { shadow: '0', opacity: 0 },
    subtle: { shadow: `0 0 10px rgba(${color.r},${color.g},${color.b},0.2)`, opacity: 0.1 },
    moderate: { shadow: `0 0 20px rgba(${color.r},${color.g},${color.b},0.3), 0 0 40px rgba(${color.r},${color.g},${color.b},0.1)`, opacity: 0.15 },
    intense: { shadow: `0 0 30px rgba(${color.r},${color.g},${color.b},0.4), 0 0 60px rgba(${color.r},${color.g},${color.b},0.2)`, opacity: 0.2 },
  };
  
  const config = intensities[intensity];
  return `shadow-[${config.shadow}]`;
}

export default function ScrollSection({ 
  id, 
  children, 
  className = '',
  align = 'left',
  zIndex = 10,
  variant = 'content',
  accentColor = 'neon',
  sticky = false,
  glowIntensity = 'none',
  borderGlow = false,
}: ScrollSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
        setScrollRatio(entry.intersectionRatio);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const alignmentStyles = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  const variantStyles = {
    hero: 'min-h-screen py-20',
    content: 'min-h-screen py-20',
    minimal: 'min-h-[50vh] py-12',
  };

  const glowClass = getGlowStyles(accentColor, glowIntensity);

  const entryAnimation = isVisible 
    ? 'opacity-100 translate-y-0' 
    : 'opacity-0 translate-y-4';

  const stickyClass = sticky 
    ? 'sticky top-0 h-screen' 
    : '';

  const borderGlowClass = borderGlow && accentColor !== 'neutral'
    ? accentColor === 'danger'
      ? 'animate-border-glow-danger'
      : 'animate-border-glow-neon'
    : '';

  const dynamicGlowStyle = borderGlow && accentColor !== 'neutral' && isVisible
    ? {
        borderColor: accentColor === 'danger'
          ? `rgba(244, 63, 94, ${0.3 + scrollRatio * 0.4})`
          : `rgba(0, 240, 255, ${0.3 + scrollRatio * 0.4})`,
        borderWidth: '1px',
        borderStyle: 'solid' as const,
      }
    : {};

  return (
    <section 
      id={id}
      ref={sectionRef}
      className={`relative flex flex-col justify-center px-4 sm:px-8 lg:px-16 ${alignmentStyles[align]} ${variantStyles[variant]} ${stickyClass} ${className}`}
      style={{ zIndex }}
    >
      <div 
        className={`max-w-6xl w-full mx-auto transition-all duration-700 ${entryAnimation} ${glowClass} ${borderGlowClass}`}
        style={dynamicGlowStyle}
      >
        {children}
      </div>
    </section>
  );
}
