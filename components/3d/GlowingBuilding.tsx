'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/scrollStore';
import { useDeviceCapabilities } from '@/lib/performanceUtils';

interface GlowingBuildingProps {
  position: [number, number, number];
  height: number;
  rank: number;
  glowColor: 'danger' | 'neon';
}

function SingleGlowingBuilding({ position, height, rank, glowColor }: GlowingBuildingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const capabilities = useDeviceCapabilities();
  
  const color = useMemo(() => {
    return glowColor === 'danger' ? '#f43f5e' : '#00f0ff';
  }, [glowColor]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    
    let glowIntensity = 0;
    
    if (scrollProgress >= 0.25 && scrollProgress < 0.5) {
      const huntProgress = (scrollProgress - 0.25) / 0.25;
      glowIntensity = huntProgress * 0.5;
    } else if (scrollProgress >= 0.5 && scrollProgress < 0.75) {
      const auditProgress = (scrollProgress - 0.5) / 0.25;
      glowIntensity = 0.5 + auditProgress * 0.5;
    } else if (scrollProgress >= 0.75 && scrollProgress < 0.9) {
      const ghostProgress = (scrollProgress - 0.75) / 0.15;
      glowIntensity = Math.max(0, 1 - ghostProgress * 1.5);
    }
    
    glowIntensity *= capabilities.glowIntensity;
    
    const time = state.clock.elapsedTime;
    const pulse = 0.85 + Math.sin(time * 2 + rank * 0.7) * 0.15;
    const finalIntensity = glowIntensity * pulse;
    
    material.opacity = finalIntensity * 0.15;
    
    const scale = 1.3 + finalIntensity * 0.2;
    meshRef.current.scale.set(scale, height * 1.05, scale);
  });
  
  if (scrollProgress < 0.25 || scrollProgress > 0.9) return null;
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

interface GlowingBuildingsProps {
  buildings: Array<{
    position: [number, number, number];
    rank: number;
    originalHeight: number;
    targetColor: string;
  }>;
}

export default function GlowingBuildings({ buildings }: GlowingBuildingsProps) {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const capabilities = useDeviceCapabilities();
  
  const topBuildings = useMemo(() => {
    return buildings.filter(b => b.rank <= 20);
  }, [buildings]);
  
  if (scrollProgress < 0.25 || scrollProgress > 0.9) return null;
  if (capabilities.quality === 'low') return null;
  
  return (
    <group>
      {topBuildings.map((building) => (
        <SingleGlowingBuilding
          key={building.rank}
          position={building.position}
          height={building.originalHeight}
          rank={building.rank}
          glowColor={building.rank <= 3 ? 'danger' : 'neon'}
        />
      ))}
    </group>
  );
}
