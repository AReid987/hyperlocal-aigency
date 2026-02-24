'use client';

import React, { useEffect, useState, useRef } from 'react';

type ScrollSectionVariant = 'hero' | 'content' | 'minimal';

interface ScrollSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  zIndex?: number;
  variant?: ScrollSectionVariant;
  accentColor?: 'neon' | 'danger' | 'neutral';
  sticky?: boolean;
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
}: ScrollSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: variant === 'hero' ? 0.1 : 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [variant]);

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

  const glowClass = accentColor === 'danger' 
    ? 'shadow-[0_0_30px_rgba(244,63,94,0.1)]' 
    : accentColor === 'neutral'
    ? ''
    : 'shadow-[0_0_30px_rgba(0,240,255,0.1)]';

  const entryAnimation = isVisible 
    ? 'opacity-100 translate-y-0' 
    : 'opacity-0 translate-y-4';

  const stickyClass = sticky 
    ? 'sticky top-0 h-screen' 
    : '';

  return (
    <section 
      id={id}
      ref={sectionRef}
      className={`relative flex flex-col justify-center px-4 sm:px-8 lg:px-16 ${alignmentStyles[align]} ${variantStyles[variant]} ${stickyClass} ${className}`}
      style={{ zIndex }}
    >
      <div className={`max-w-6xl w-full mx-auto transition-all duration-700 ${entryAnimation} ${glowClass}`}>
        {children}
      </div>
    </section>
  );
}
