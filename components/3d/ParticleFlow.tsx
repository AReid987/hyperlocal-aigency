'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/scrollStore';

interface ParticleFlowProps {
  buildingPositions: {
    position: [number, number, number];
    rank: number;
    targetColor: string;
  }[];
}

// Particle class for flow animation
class FlowParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  target: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
  color: THREE.Color;

  constructor(startPos: THREE.Vector3, targetPos: THREE.Vector3, color: THREE.Color) {
    this.position = startPos.clone();
    this.target = targetPos.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.life = 0;
    this.maxLife = 2 + Math.random();
    this.active = false;
    this.color = color.clone();
  }

  spawn(startPos: THREE.Vector3, targetPos: THREE.Vector3, color: THREE.Color) {
    this.position.copy(startPos);
    this.target.copy(targetPos);
    this.color.copy(color);
    this.life = 0;
    this.active = true;
    this.velocity.set(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 0.5
    );
  }

  update(deltaTime: number): boolean {
    if (!this.active) return false;

    this.life += deltaTime;
    if (this.life >= this.maxLife) {
      this.active = false;
      return false;
    }

    // Calculate direction to target with some randomness
    const direction = new THREE.Vector3()
      .subVectors(this.target, this.position)
      .normalize();

    // Add some curve to the path
    const t = this.life / this.maxLife;
    const curve = Math.sin(t * Math.PI) * 2;

    // Update velocity towards target
    this.velocity.lerp(direction.multiplyScalar(3), 0.05);
    this.velocity.y += curve * 0.01;

    // Move particle
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    return true;
  }

  getOpacity(): number {
    if (!this.active) return 0;
    const t = this.life / this.maxLife;
    // Fade in and out
    return Math.sin(t * Math.PI) * 0.8;
  }
}

export default function ParticleFlow({ buildingPositions }: ParticleFlowProps) {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<FlowParticle[]>([]);
  const spawnTimerRef = useRef(0);

  // Get source (red buildings rank 1-3) and target (cyan buildings rank 4-20) positions
  const { sourceBuildings, targetBuildings } = useMemo(() => {
    const sources = buildingPositions.filter(b => b.rank <= 3);
    const targets = buildingPositions.filter(b => b.rank > 3 && b.rank <= 20);
    return { sourceBuildings: sources, targetBuildings: targets };
  }, [buildingPositions]);

  // Initialize particles
  useMemo(() => {
    const particles: FlowParticle[] = [];
    const particleCount = 300;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new FlowParticle(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Color('#00f0ff')
      ));
    }
    
    particlesRef.current = particles;
  }, []);

  // Initialize buffer geometry
  const { positions, colors } = useMemo(() => {
    const particleCount = 300;
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = -100; // Hide initially
      pos[i * 3 + 2] = 0;
      col[i * 3] = 0;
      col[i * 3 + 1] = 0.94; // Cyan
      col[i * 3 + 2] = 1;
    }
    
    return { positions: pos, colors: col };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Only show particles during Audit section (0.5 - 0.75 scroll)
    if (scrollProgress < 0.5 || scrollProgress > 0.75) {
      // Hide all particles
      const positionsAttr = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < particlesRef.current.length; i++) {
        positionsAttr.array[i * 3 + 1] = -100;
      }
      positionsAttr.needsUpdate = true;
      return;
    }

    // const auditProgress = (scrollProgress - 0.5) / 0.25;
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const colorsAttr = pointsRef.current.geometry.attributes.color;

    // Spawn new particles
    spawnTimerRef.current += delta;
    const spawnRate = 0.02; // Spawn every 20ms
    
    if (spawnTimerRef.current > spawnRate && sourceBuildings.length > 0 && targetBuildings.length > 0) {
      spawnTimerRef.current = 0;
      
      // Find inactive particle to spawn
      for (const particle of particlesRef.current) {
        if (!particle.active) {
          // Pick random source and target
          const sourceIdx = Math.floor(Math.random() * sourceBuildings.length);
          const targetIdx = Math.floor(Math.random() * targetBuildings.length);
          
          const source = sourceBuildings[sourceIdx];
          const target = targetBuildings[targetIdx];
          
          // Color gradient: red (source) to cyan (target)
          const color = new THREE.Color('#f43f5e').lerp(
            new THREE.Color('#00f0ff'),
            Math.random()
          );
          
          particle.spawn(
            new THREE.Vector3(source.position[0], source.position[1] + 2, source.position[2]),
            new THREE.Vector3(target.position[0], target.position[1] + 1, target.position[2]),
            color
          );
          break;
        }
      }
    }

    // Update all particles
    particlesRef.current.forEach((particle, i) => {
      particle.update(delta);
      
      positionsAttr.array[i * 3] = particle.position.x;
      positionsAttr.array[i * 3 + 1] = particle.position.y;
      positionsAttr.array[i * 3 + 2] = particle.position.z;
      
      const opacity = particle.getOpacity();
      colorsAttr.array[i * 3] = particle.color.r * opacity;
      colorsAttr.array[i * 3 + 1] = particle.color.g * opacity;
      colorsAttr.array[i * 3 + 2] = particle.color.b * opacity;
    });

    positionsAttr.needsUpdate = true;
    colorsAttr.needsUpdate = true;
  });

  // Don't render if outside scroll range
  if (scrollProgress < 0.45 || scrollProgress > 0.8) return null;

  const opacity = scrollProgress < 0.5 
    ? (scrollProgress - 0.45) * 20 
    : scrollProgress > 0.75 
    ? (0.8 - scrollProgress) * 20 
    : 1;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={300} 
          array={positions} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-color" 
          count={300} 
          array={colors} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        vertexColors 
        transparent 
        opacity={opacity} 
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
