'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type AccentColor = 'neon' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  accentColor?: AccentColor;
  isLoading?: boolean;
  asChild?: boolean;
  className?: string;
}

export default function Button({ 
  variant = 'primary', 
  children, 
  accentColor = 'neon',
  isLoading = false,
  asChild = false,
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-mono font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
  
  const variantStyles: Record<ButtonVariant, string> = {
    primary: accentColor === 'danger'
      ? 'bg-danger text-white hover:bg-danger/90 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]'
      : 'bg-neon text-void hover:bg-neon/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]',
    secondary: 'bg-zinc-800/60 text-zinc-100 hover:bg-zinc-700/60 border border-zinc-600/50 backdrop-blur-sm',
    danger: 'bg-danger text-white hover:bg-danger/90 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]',
    ghost: 'bg-transparent text-zinc-300 hover:text-neon hover:bg-zinc-800/50 border border-zinc-700/50',
  };

  const loadingStyles = 'relative text-transparent pointer-events-none';
  
  const loadingSpinner = (
    <span className="absolute inset-0 flex items-center justify-center">
      <svg 
        className="animate-spin h-5 w-5" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </span>
  );

  const buttonContent = (
    <>
      {isLoading && loadingSpinner}
      {children}
    </>
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement(child, {
      className: `${baseStyles} ${variantStyles[variant]} ${className} ${isLoading ? loadingStyles : ''}`,
      disabled: props.disabled || isLoading,
      ...props,
    });
  }

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${isLoading ? loadingStyles : ''}`}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {buttonContent}
    </button>
  );
}
