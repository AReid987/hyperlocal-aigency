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

class FlowParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  target: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
  color: THREE.Color;
  arcHeight: number;
  arcPhase: number;

  constructor(startPos: THREE.Vector3, targetPos: THREE.Vector3, color: THREE.Color) {
    this.position = startPos.clone();
    this.target = targetPos.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.life = 0;
    this.maxLife = 1.5 + Math.random() * 1.5;
    this.active = false;
    this.color = color.clone();
    this.arcHeight = 3 + Math.random() * 4;
    this.arcPhase = Math.random() * Math.PI;
  }

  spawn(startPos: THREE.Vector3, targetPos: THREE.Vector3, color: THREE.Color) {
    this.position.copy(startPos);
    this.target.copy(targetPos);
    this.color.copy(color);
    this.life = 0;
    this.active = true;
    this.arcHeight = 3 + Math.random() * 4;
    this.arcPhase = Math.random() * Math.PI;
    this.velocity.set(
      (Math.random() - 0.5) * 0.3,
      Math.random() * 0.3,
      (Math.random() - 0.5) * 0.3
    );
  }

  update(deltaTime: number, startPos: THREE.Vector3): boolean {
    if (!this.active) return false;

    this.life += deltaTime;
    if (this.life >= this.maxLife) {
      this.active = false;
      return false;
    }

    const t = this.life / this.maxLife;

    // Arc trajectory: lerp position with parabolic height
    this.position.lerpVectors(startPos, this.target, t);
    this.position.y += Math.sin(t * Math.PI) * this.arcHeight;
    // Add slight lateral drift
    this.position.x += Math.sin(t * Math.PI * 2 + this.arcPhase) * 0.3;

    return true;
  }

  getOpacity(): number {
    if (!this.active) return 0;
    const t = this.life / this.maxLife;
    return Math.sin(t * Math.PI) * 0.9;
  }
}

const PARTICLE_COUNT = 400;

export default function ParticleFlow({ buildingPositions }: ParticleFlowProps) {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<FlowParticle[]>([]);
  const spawnTimerRef = useRef(0);
  const startPositionsRef = useRef<THREE.Vector3[]>([]);

  const { sourceBuildings, targetBuildings } = useMemo(() => {
    const sources = buildingPositions.filter(b => b.rank <= 3);
    const targets = buildingPositions.filter(b => b.rank > 3 && b.rank <= 20);
    return { sourceBuildings: sources, targetBuildings: targets };
  }, [buildingPositions]);

  useMemo(() => {
    const particles: FlowParticle[] = [];
    const starts: THREE.Vector3[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new FlowParticle(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Color('#00f0ff')
      ));
      starts.push(new THREE.Vector3(0, 0, 0));
    }
    particlesRef.current = particles;
    startPositionsRef.current = starts;
  }, []);

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const siz = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 1] = -100;
      col[i * 3] = 0;
      col[i * 3 + 1] = 0.94;
      col[i * 3 + 2] = 1;
      siz[i] = 0.1 + Math.random() * 0.15;
    }
    return { positions: pos, colors: col, sizes: siz };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const colorsAttr = pointsRef.current.geometry.attributes.color;

    if (scrollProgress < 0.5 || scrollProgress > 0.75) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positionsAttr.array[i * 3 + 1] = -100;
        if (particlesRef.current[i].active) {
          particlesRef.current[i].active = false;
        }
      }
      positionsAttr.needsUpdate = true;
      return;
    }

    const auditIntensity = Math.min(1, (scrollProgress - 0.5) / 0.1);
    const spawnRate = Math.max(0.01, 0.04 * (1 - auditIntensity * 0.5));

    spawnTimerRef.current += delta;
    if (spawnTimerRef.current > spawnRate && sourceBuildings.length > 0 && targetBuildings.length > 0) {
      spawnTimerRef.current = 0;

      const spawnBatch = auditIntensity > 0.5 ? 3 : 1;
      let spawned = 0;

      for (let p = 0; p < PARTICLE_COUNT && spawned < spawnBatch; p++) {
        const particle = particlesRef.current[p];
        if (!particle.active) {
          const sourceIdx = Math.floor(Math.random() * sourceBuildings.length);
          const targetIdx = Math.floor(Math.random() * targetBuildings.length);

          const source = sourceBuildings[sourceIdx];
          const target = targetBuildings[targetIdx];

          const tColor = Math.random();
          const color = new THREE.Color('#f43f5e').lerp(new THREE.Color('#00f0ff'), tColor);

          const startVec = new THREE.Vector3(
            source.position[0] + (Math.random() - 0.5) * 0.5,
            source.position[1] + 2,
            source.position[2] + (Math.random() - 0.5) * 0.5
          );

          startPositionsRef.current[p].copy(startVec);

          particle.spawn(
            startVec,
            new THREE.Vector3(
              target.position[0] + (Math.random() - 0.5) * 0.5,
              target.position[1] + 1,
              target.position[2] + (Math.random() - 0.5) * 0.5
            ),
            color
          );

          spawned++;
        }
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = particlesRef.current[i];
      particle.update(delta, startPositionsRef.current[i]);

      if (particle.active) {
        positionsAttr.array[i * 3] = particle.position.x;
        positionsAttr.array[i * 3 + 1] = particle.position.y;
        positionsAttr.array[i * 3 + 2] = particle.position.z;

        const opacity = particle.getOpacity();
        colorsAttr.array[i * 3] = particle.color.r * opacity;
        colorsAttr.array[i * 3 + 1] = particle.color.g * opacity;
        colorsAttr.array[i * 3 + 2] = particle.color.b * opacity;
      } else {
        positionsAttr.array[i * 3 + 1] = -100;
        colorsAttr.array[i * 3] = 0;
        colorsAttr.array[i * 3 + 1] = 0;
        colorsAttr.array[i * 3 + 2] = 0;
      }
    }

    positionsAttr.needsUpdate = true;
    colorsAttr.needsUpdate = true;
  });

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
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
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
