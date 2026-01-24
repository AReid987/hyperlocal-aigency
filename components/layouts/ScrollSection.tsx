import React from 'react';

interface ScrollSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  zIndex?: number;
}

export default function ScrollSection({ 
  id, 
  children, 
  className = '',
  align = 'left',
  zIndex = 10,
}: ScrollSectionProps) {
  const alignmentStyles = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  return (
    <section 
      id={id}
      className={`relative min-h-screen flex flex-col justify-center px-4 sm:px-8 lg:px-16 ${alignmentStyles[align]} ${className}`}
      style={{ zIndex }}
    >
      <div className="max-w-6xl w-full mx-auto">
        {children}
      </div>
    </section>
  );
}
