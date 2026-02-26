'use client';

import React, { useMemo } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useScrollStore } from '@/lib/scrollStore';
import { useDeviceCapabilities } from '@/lib/performanceUtils';

export default function BloomEffect() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const capabilities = useDeviceCapabilities();
  
  const bloomIntensity = useMemo(() => {
    if (!capabilities.bloomEnabled) return 0;
    
    let intensity = 0;
    
    if (scrollProgress >= 0.25 && scrollProgress < 0.5) {
      intensity = 0.3;
    } else if (scrollProgress >= 0.5 && scrollProgress < 0.75) {
      const auditProgress = (scrollProgress - 0.5) / 0.25;
      intensity = 0.5 + auditProgress * 0.3;
    } else if (scrollProgress >= 0.75 && scrollProgress < 0.9) {
      const ghostProgress = (scrollProgress - 0.75) / 0.15;
      intensity = 0.8 - ghostProgress * 0.3;
    } else if (scrollProgress >= 0.9) {
      intensity = 0.5;
    }
    
    return intensity * capabilities.bloomIntensity;
  }, [scrollProgress, capabilities.bloomEnabled, capabilities.bloomIntensity]);
  
  if (!capabilities.bloomEnabled || bloomIntensity === 0) {
    return null;
  }
  
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.8}
      />
    </EffectComposer>
  );
}
