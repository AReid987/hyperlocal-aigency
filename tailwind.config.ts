import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#09090b',
        neon: '#00f0ff',
        danger: '#f43f5e',
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)' },
        },
        borderPulse: {
          '0%, 100%': { borderColor: 'rgba(0, 240, 255, 0.2)' },
          '50%': { borderColor: 'rgba(0, 240, 255, 0.6)' },
        },
        flicker: {
          '0%, 90%, 100%': { opacity: '1' },
          '91%': { opacity: '0.8' },
          '93%': { opacity: '1' },
          '95%': { opacity: '0.6' },
          '97%': { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.3), 0 0 20px rgba(0, 240, 255, 0.1)' },
          '50%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)' },
        },
        glowPulseDanger: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(244, 63, 94, 0.3), 0 0 20px rgba(244, 63, 94, 0.1)' },
          '50%': { boxShadow: '0 0 15px rgba(244, 63, 94, 0.5), 0 0 40px rgba(244, 63, 94, 0.2)' },
        },
        borderGlowNeon: {
          '0%, 100%': { 
            borderColor: 'rgba(0, 240, 255, 0.3)',
            boxShadow: '0 0 5px rgba(0, 240, 255, 0.2), inset 0 0 5px rgba(0, 240, 255, 0.05)'
          },
          '50%': { 
            borderColor: 'rgba(0, 240, 255, 0.7)',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(0, 240, 255, 0.1)'
          },
        },
        borderGlowDanger: {
          '0%, 100%': { 
            borderColor: 'rgba(244, 63, 94, 0.3)',
            boxShadow: '0 0 5px rgba(244, 63, 94, 0.2), inset 0 0 5px rgba(244, 63, 94, 0.05)'
          },
          '50%': { 
            borderColor: 'rgba(244, 63, 94, 0.7)',
            boxShadow: '0 0 15px rgba(244, 63, 94, 0.4), inset 0 0 10px rgba(244, 63, 94, 0.1)'
          },
        },
        filterGlow: {
          '0%, 100%': { 
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.1)'
          },
          '50%': { 
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.3)'
          },
        },
        dataStream: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        revealWidth: {
          from: { width: '0' },
          to: { width: '100%' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'border-pulse': 'borderPulse 3s ease-in-out infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'glow-pulse-danger': 'glowPulseDanger 2s ease-in-out infinite',
        'border-glow-neon': 'borderGlowNeon 3s ease-in-out infinite',
        'border-glow-danger': 'borderGlowDanger 3s ease-in-out infinite',
        'filter-glow': 'filterGlow 4s ease-in-out infinite',
        'data-stream': 'dataStream 2s linear infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'reveal-width': 'revealWidth 0.5s ease-out forwards',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2), 0 0 60px rgba(0, 240, 255, 0.1)',
        'glow-cyan-sm': '0 0 10px rgba(0, 240, 255, 0.4), 0 0 20px rgba(0, 240, 255, 0.2)',
        'glow-cyan-lg': '0 0 30px rgba(0, 240, 255, 0.6), 0 0 60px rgba(0, 240, 255, 0.3), 0 0 90px rgba(0, 240, 255, 0.15)',
        'glow-red': '0 0 20px rgba(244, 63, 94, 0.5), 0 0 40px rgba(244, 63, 94, 0.2), 0 0 60px rgba(244, 63, 94, 0.1)',
        'glow-red-sm': '0 0 10px rgba(244, 63, 94, 0.4), 0 0 20px rgba(244, 63, 94, 0.2)',
        'glow-red-lg': '0 0 30px rgba(244, 63, 94, 0.6), 0 0 60px rgba(244, 63, 94, 0.3), 0 0 90px rgba(244, 63, 94, 0.15)',
      },
    },
  },
  plugins: [],
};
export default config;
