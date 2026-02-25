'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type DeviceQuality = 'high' | 'medium' | 'low';

interface DeviceCapabilities {
  quality: DeviceQuality;
  gpu: string | null;
  maxTextureSize: number;
  isMobile: boolean;
  isTablet: boolean;
  touchSupport: boolean;
  pixelRatio: number;
  recommendedParticleCount: number;
  bloomEnabled: boolean;
  bloomIntensity: number;
  glowIntensity: number;
}

function detectGPU(): string | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return null;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
  } catch {
    return null;
  }
  return null;
}

function getMaxTextureSize(): number {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return 4096;
    return gl.getParameter(gl.MAX_TEXTURE_SIZE);
  } catch {
    return 4096;
  }
}

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isSmallScreen = window.innerWidth < 768;
  return isMobileUA || (isSmallScreen && 'ontouchstart' in window);
}

function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const isTabletUA = /ipad|android(?!.*mobile)/i.test(ua);
  const isMediumScreen = window.innerWidth >= 768 && window.innerWidth < 1024;
  return isTabletUA || (isMediumScreen && 'ontouchstart' in window);
}

function assessGPUPerformance(gpuInfo: string | null, maxTextureSize: number): DeviceQuality {
  if (!gpuInfo) return 'medium';
  
  const gpu = gpuInfo.toLowerCase();
  
  const highEndGPUs = [
    'nvidia geforce rtx', 'nvidia geforce gtx 1', 'nvidia geforce gtx 2', 'nvidia geforce gtx 3',
    'amd radeon rx 6', 'amd radeon rx 7', 'apple m1', 'apple m2', 'apple m3',
    'intel arc'
  ];
  
  const lowEndGPUs = [
    'intel hd graphics', 'intel uhd graphics', 'intel iris', 'mali', 'adreno', 'powervr'
  ];
  
  if (highEndGPUs.some(hg => gpu.includes(hg))) {
    return 'high';
  }
  
  if (lowEndGPUs.some(lg => gpu.includes(lg))) {
    return 'low';
  }
  
  if (maxTextureSize >= 16384) {
    return 'high';
  }
  
  if (maxTextureSize >= 8192) {
    return 'medium';
  }
  
  return 'low';
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  const gpu = detectGPU();
  const maxTextureSize = getMaxTextureSize();
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  const touchSupport = typeof window !== 'undefined' && 'ontouchstart' in window;
  const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1;
  
  let quality: DeviceQuality;
  
  if (isMobile) {
    quality = 'low';
  } else if (isTablet) {
    quality = 'medium';
  } else {
    quality = assessGPUPerformance(gpu, maxTextureSize);
  }
  
  const configs: Record<DeviceQuality, {
    particles: number;
    bloom: boolean;
    bloomIntensity: number;
    glowIntensity: number;
  }> = {
    high: {
      particles: 500,
      bloom: true,
      bloomIntensity: 0.8,
      glowIntensity: 1.0
    },
    medium: {
      particles: 250,
      bloom: true,
      bloomIntensity: 0.5,
      glowIntensity: 0.7
    },
    low: {
      particles: 100,
      bloom: false,
      bloomIntensity: 0,
      glowIntensity: 0.5
    }
  };
  
  const config = configs[quality];
  
  return {
    quality,
    gpu,
    maxTextureSize,
    isMobile,
    isTablet,
    touchSupport,
    pixelRatio,
    recommendedParticleCount: config.particles,
    bloomEnabled: config.bloom,
    bloomIntensity: config.bloomIntensity,
    glowIntensity: config.glowIntensity
  };
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    quality: 'medium',
    gpu: null,
    maxTextureSize: 4096,
    isMobile: false,
    isTablet: false,
    touchSupport: false,
    pixelRatio: 1,
    recommendedParticleCount: 250,
    bloomEnabled: true,
    bloomIntensity: 0.5,
    glowIntensity: 0.7
  });
  
  useEffect(() => {
    const caps = detectDeviceCapabilities();
    setCapabilities(caps);
  }, []);
  
  return capabilities;
}

export function useFPSMonitor(threshold: number = 50): {
  fps: number;
  isLowFPS: boolean;
  shouldReduceQuality: boolean;
} {
  const [fps, setFps] = useState(60);
  const [isLowFPS, setIsLowFPS] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const lowFPSCount = useRef(0);
  
  useEffect(() => {
    let rafId: number;
    
    const tick = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        const currentFPS = Math.round(
          (frameCount.current * 1000) / (currentTime - lastTime.current)
        );
        setFps(currentFPS);
        
        if (currentFPS < threshold) {
          lowFPSCount.current++;
          if (lowFPSCount.current >= 3) {
            setIsLowFPS(true);
          }
        } else {
          lowFPSCount.current = Math.max(0, lowFPSCount.current - 1);
          if (lowFPSCount.current === 0) {
            setIsLowFPS(false);
          }
        }
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      rafId = requestAnimationFrame(tick);
    };
    
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [threshold]);
  
  return {
    fps,
    isLowFPS,
    shouldReduceQuality: isLowFPS
  };
}

export function useAdaptiveQuality(
  capabilities: DeviceCapabilities
): {
  particleCount: number;
  bloomIntensity: number;
  glowIntensity: number;
  shouldSkipFrame: () => boolean;
} {
  const { isLowFPS } = useFPSMonitor(50);
  const frameCounter = useRef(0);
  
  const particleMultiplier = isLowFPS ? 0.5 : 1;
  const bloomMultiplier = isLowFPS ? 0.5 : 1;
  const glowMultiplier = isLowFPS ? 0.7 : 1;
  
  const shouldSkipFrame = useCallback(() => {
    frameCounter.current++;
    if (capabilities.quality === 'low') {
      return frameCounter.current % 3 !== 0;
    }
    if (isLowFPS) {
      return frameCounter.current % 2 !== 0;
    }
    return false;
  }, [capabilities.quality, isLowFPS]);
  
  return {
    particleCount: Math.floor(capabilities.recommendedParticleCount * particleMultiplier),
    bloomIntensity: capabilities.bloomEnabled ? capabilities.bloomIntensity * bloomMultiplier : 0,
    glowIntensity: capabilities.glowIntensity * glowMultiplier,
    shouldSkipFrame
  };
}
