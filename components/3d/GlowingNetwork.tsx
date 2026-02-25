'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/scrollStore';
import { useDeviceCapabilities } from '@/lib/performanceUtils';

interface NetworkNode {
  position: [number, number, number];
  color: string;
  size: number;
  label: string;
}

const NETWORK_NODES: NetworkNode[] = [
  { position: [-10, 6, -5], color: '#00f0ff', size: 1.2, label: 'Cloud' },
  { position: [8, 4, 2], color: '#f43f5e', size: 1.5, label: 'Core' },
  { position: [0, 8, -8], color: '#00f0ff', size: 1.0, label: 'Edge' },
  { position: [-6, 2, 6], color: '#a78bfa', size: 0.9, label: 'DB' },
  { position: [5, 7, 8], color: '#00f0ff', size: 1.1, label: 'AI' },
  { position: [12, 3, -3], color: '#22c55e', size: 0.8, label: 'Cache' },
];

interface DataPacket {
  position: THREE.Vector3;
  sourceIdx: number;
  targetIdx: number;
  progress: number;
  speed: number;
  color: THREE.Color;
}

function NetworkNodeMesh({ node, index, progress }: { 
  node: NetworkNode; 
  index: number;
  progress: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.x = time * 0.3 + index * 0.5;
    meshRef.current.rotation.y = time * 0.4 + index * 0.3;
    
    const pulse = 0.9 + Math.sin(time * 2 + index) * 0.1;
    meshRef.current.scale.setScalar(node.size * pulse * progress);
    
    if (glowRef.current) {
      const glowPulse = 0.8 + Math.sin(time * 3 + index * 0.7) * 0.2;
      glowRef.current.scale.setScalar(node.size * 1.5 * glowPulse * progress);
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 * progress * glowPulse;
    }
  });
  
  return (
    <group position={node.position}>
      <mesh ref={meshRef}>
        {index % 2 === 0
          ? <sphereGeometry args={[node.size * 0.5, 16, 12]} />
          : <boxGeometry args={[node.size * 0.6, node.size * 0.4, node.size * 0.4]} />
        }
        <meshBasicMaterial color={node.color} transparent opacity={progress * 0.9} wireframe />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[node.size * 0.5, 8, 6]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function NetworkConnections({ nodes, progress }: {
  nodes: NetworkNode[];
  progress: number;
}) {
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const { positions, colors, connectionCount } = useMemo(() => {
    const connections: Array<[NetworkNode, NetworkNode]> = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].position[0] - nodes[j].position[0], 2) +
          Math.pow(nodes[i].position[1] - nodes[j].position[1], 2) +
          Math.pow(nodes[i].position[2] - nodes[j].position[2], 2)
        );
        if (dist < 20) {
          connections.push([nodes[i], nodes[j]]);
        }
      }
    }
    
    const pos = new Float32Array(connections.length * 6);
    const col = new Float32Array(connections.length * 6);
    
    connections.forEach((conn, i) => {
      const [a, b] = conn;
      pos[i * 6] = a.position[0];
      pos[i * 6 + 1] = a.position[1];
      pos[i * 6 + 2] = a.position[2];
      pos[i * 6 + 3] = b.position[0];
      pos[i * 6 + 4] = b.position[1];
      pos[i * 6 + 5] = b.position[2];
      
      const colorA = new THREE.Color(a.color);
      const colorB = new THREE.Color(b.color);
      
      col[i * 6] = colorA.r;
      col[i * 6 + 1] = colorA.g;
      col[i * 6 + 2] = colorA.b;
      col[i * 6 + 3] = colorB.r;
      col[i * 6 + 4] = colorB.g;
      col[i * 6 + 5] = colorB.b;
    });
    
    return { positions: pos, colors: col, connectionCount: connections.length };
  }, [nodes]);
  
  useFrame((state) => {
    if (!linesRef.current) return;
    const material = linesRef.current.material as THREE.LineBasicMaterial;
    const time = state.clock.elapsedTime;
    const pulseOpacity = 0.3 + Math.sin(time * 2) * 0.1;
    material.opacity = progress * pulseOpacity;
  });
  
  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={connectionCount * 2}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={connectionCount * 2}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={progress * 0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function NetworkDataFlow({ nodes, progress }: {
  nodes: NetworkNode[];
  progress: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const capabilities = useDeviceCapabilities();
  
  const particleCount = useMemo(() => {
    const base = capabilities.quality === 'high' ? 150 : 
                 capabilities.quality === 'medium' ? 80 : 40;
    return base;
  }, [capabilities.quality]);
  
  const packetsRef = useRef<DataPacket[]>([]);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    packetsRef.current = Array.from({ length: particleCount }, () => {
      const sourceIdx = Math.floor(Math.random() * nodes.length);
      const targetIdx = (sourceIdx + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length;
      const source = nodes[sourceIdx];
      const target = nodes[targetIdx];
      
      return {
        position: new THREE.Vector3(...source.position),
        sourceIdx,
        targetIdx,
        progress: Math.random(),
        speed: 0.2 + Math.random() * 0.4,
        color: new THREE.Color(source.color).lerp(new THREE.Color(target.color), Math.random())
      };
    });
  }, [nodes, particleCount]);
  
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      col[i * 3] = 0;
      col[i * 3 + 1] = 0.94;
      col[i * 3 + 2] = 1;
    }
    
    return { positions: pos, colors: col };
  }, [particleCount]);
  
  useFrame((_, delta) => {
    if (!pointsRef.current || packetsRef.current.length === 0) return;
    
    const posAttr = pointsRef.current.geometry.attributes.position;
    const colAttr = pointsRef.current.geometry.attributes.color;
    
    for (let i = 0; i < packetsRef.current.length; i++) {
      const packet = packetsRef.current[i];
      packet.progress += delta * packet.speed;
      
      if (packet.progress > 1) {
        packet.progress = 0;
        packet.sourceIdx = packet.targetIdx;
        packet.targetIdx = (packet.targetIdx + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length;
        
        const source = nodes[packet.sourceIdx];
        const target = nodes[packet.targetIdx];
        packet.color = new THREE.Color(source.color).lerp(new THREE.Color(target.color), Math.random());
      }
      
      const source = nodes[packet.sourceIdx];
      const target = nodes[packet.targetIdx];
      const t = packet.progress;
      
      const x = source.position[0] + (target.position[0] - source.position[0]) * t;
      const y = source.position[1] + (target.position[1] - source.position[1]) * t + Math.sin(t * Math.PI) * 2;
      const z = source.position[2] + (target.position[2] - source.position[2]) * t;
      
      posAttr.array[i * 3] = x;
      posAttr.array[i * 3 + 1] = y;
      posAttr.array[i * 3 + 2] = z;
      
      const opacity = Math.sin(t * Math.PI) * 0.9;
      colAttr.array[i * 3] = packet.color.r * opacity;
      colAttr.array[i * 3 + 1] = packet.color.g * opacity;
      colAttr.array[i * 3 + 2] = packet.color.b * opacity;
    }
    
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={progress * 0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function GlowingNetwork() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const capabilities = useDeviceCapabilities();
  
  const networkProgress = useMemo(() => {
    if (scrollProgress < 0.9) return 0;
    return Math.min(1, (scrollProgress - 0.9) / 0.1);
  }, [scrollProgress]);
  
  const easeProgress = useMemo(() => {
    return networkProgress * networkProgress * (3 - 2 * networkProgress);
  }, [networkProgress]);
  
  if (scrollProgress < 0.88) return null;
  
  const particlesEnabled = capabilities.quality !== 'low';
  
  return (
    <group>
      {NETWORK_NODES.map((node, i) => (
        <NetworkNodeMesh
          key={i}
          node={node}
          index={i}
          progress={easeProgress}
        />
      ))}
      
      <NetworkConnections nodes={NETWORK_NODES} progress={easeProgress} />
      
      {particlesEnabled && (
        <NetworkDataFlow nodes={NETWORK_NODES} progress={easeProgress} />
      )}
    </group>
  );
}
