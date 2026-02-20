import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-lg font-mono font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-neon text-void hover:bg-neon/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-600',
    danger: 'bg-danger text-white hover:bg-danger/90 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]',
    ghost: 'bg-transparent text-zinc-300 hover:text-neon hover:bg-zinc-800/50 border border-zinc-700/50',
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
