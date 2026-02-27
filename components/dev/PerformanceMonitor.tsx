'use client';

import { useEffect, useState, useRef } from 'react';
import { useScrollStore } from '@/lib/scrollStore';

/**
 * Performance Monitor Component
 * Displays FPS, memory usage, and scroll progress in development mode
 * Only renders when NEXT_PUBLIC_SHOW_FPS_MONITOR is true
 */
export default function PerformanceMonitor() {
  const [fps, setFps] = useState<number>(0);
  const [memory, setMemory] = useState<number | null>(null);
  const { scrollProgress, currentStage } = useScrollStore();
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (
      process.env.NODE_ENV !== 'development' &&
      process.env.NEXT_PUBLIC_SHOW_FPS_MONITOR !== 'true'
    ) {
      return;
    }

    const updateFPS = () => {
      frameCountRef.current++;
      const now = Date.now();

      // Update FPS every second
      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Update memory usage if available (Chrome only)
        if ('memory' in performance) {
          const mem = (performance as any).memory;
          setMemory(Math.round(mem.usedJSHeapSize / 1048576)); // Convert to MB
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateFPS);
    };

    animationFrameRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Don't render if not enabled
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.NEXT_PUBLIC_SHOW_FPS_MONITOR !== 'true'
  ) {
    return null;
  }

  const fpsColor = fps >= 50 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400';
  const scrollPercentage = Math.round(scrollProgress * 100);

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-black/80 backdrop-blur-sm border border-[#00f0ff]/30 rounded-lg p-3 font-mono text-xs shadow-lg">
      <div className="space-y-1.5">
        {/* FPS */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">FPS:</span>
          <span className={`font-bold ${fpsColor}`}>{fps}</span>
        </div>

        {/* Memory */}
        {memory !== null && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">Memory:</span>
            <span className="text-[#00f0ff]">{memory} MB</span>
          </div>
        )}

        {/* Scroll Progress */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Scroll:</span>
          <span className="text-[#00f0ff]">{scrollPercentage}%</span>
        </div>

        {/* Current Stage */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-400">Stage:</span>
          <span className="text-[#00f0ff]">{currentStage}</span>
        </div>

        {/* Separator */}
        <div className="border-t border-zinc-700 my-2" />

        {/* Viewport Size */}
        {typeof window !== 'undefined' && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">Viewport:</span>
            <span className="text-zinc-300">
              {window.innerWidth}×{window.innerHeight}
            </span>
          </div>
        )}

        {/* Connection Type */}
        {typeof navigator !== 'undefined' && 'connection' in navigator && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">Connection:</span>
            <span className="text-zinc-300">
              {(navigator as any).connection?.effectiveType || 'unknown'}
            </span>
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-700 hover:bg-zinc-600 rounded-full text-[10px] text-white flex items-center justify-center transition-colors"
        aria-label="Close performance monitor"
      >
        ×
      </button>
    </div>
  );
}
