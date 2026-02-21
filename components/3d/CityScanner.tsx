'use client';

import React, { useRef, useMemo, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/scrollStore';
import ParticleFlow from './ParticleFlow';

// Building data interface
interface Building {
  index: number;
  position: [number, number, number];
  height: number;
  baseColor: string;
  targetColor: string;
  currentColor: string;
  rank: number; // Height rank
  originalHeight: number;
  dissolutionProgress: number;
}

// Error Boundary Component
class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Three.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-void flex items-center justify-center">
          <div className="text-center text-zinc-300">
            <h3 className="text-xl mb-2">3D Engine Error</h3>
            <p className="text-sm text-zinc-400">
              WebGL not supported or failed to initialize
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance Monitor Component
function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frameCount.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime.current >= 1000) {
      setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)));
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  });

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 z-50 text-xs text-zinc-400 bg-black bg-opacity-50 px-2 py-1 rounded">
      FPS: {fps}
    </div>
  );
}

// Scanner Sweep Effect Component
function ScannerSweep() {
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  
  useFrame((state) => {
    if (scrollProgress > 0.25) return;
    
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const cycleTime = 3;
      const progress = (time % cycleTime) / cycleTime;
      meshRef.current.position.x = -25 + progress * 50;
    }
  });

  if (scrollProgress > 0.25) return null;

  return (
    <mesh ref={meshRef} position={[-25, 5, 0]}>
      <planeGeometry args={[1, 50]} />
      <meshBasicMaterial 
        color="#00f0ff" 
        transparent 
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Enhanced Buildings Grid Component with optimizations
function BuildingsGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const setTargetBuildingPosition = useScrollStore((state) => state.setTargetBuildingPosition);
  const setBuildingData = useScrollStore((state) => state.setBuildingData);
  const frameCount = useRef(0);
  
  const buildings = useMemo(() => {
    const buildingData: Building[] = [];
    const gridX = 25;
    const gridZ = 20; 
    const spacing = 2;
    const offsetX = (gridX - 1) / 2;
    const offsetZ = (gridZ - 1) / 2;
    
    for (let x = 0; x < gridX; x++) {
      for (let z = 0; z < gridZ; z++) {
        const posX = (x - offsetX) * spacing;
        const posZ = (z - offsetZ) * spacing;
        const height = Math.abs(((Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1) * 7) + 1;
        
        buildingData.push({
          index: x * gridZ + z,
          position: [posX, height / 2, posZ],
          height,
          baseColor: '#333333',
          targetColor: '#333333',
          currentColor: '#333333',
          rank: 0,
          originalHeight: height,
          dissolutionProgress: 0,
        });
      }
    }
    
    buildingData.sort((a, b) => b.originalHeight - a.originalHeight);
    buildingData.forEach((building, index) => {
      building.rank = index + 1;
      if (index < 3) {
        building.targetColor = '#f43f5e';
      } else if (index < 20) {
        building.targetColor = '#00f0ff';
      } else {
        building.targetColor = '#333333';
      }
    });
    
    return buildingData;
  }, []);

  useEffect(() => {
    const target = buildings.find(b => b.rank === 10);
    if (target) {
      setTargetBuildingPosition(target.position);
    }
    // Extract building data for ParticleFlow
    setBuildingData(buildings.map(b => ({
      position: b.position,
      rank: b.rank,
      targetColor: b.targetColor,
    })));
  }, [buildings, setTargetBuildingPosition, setBuildingData]);

  useFrame((state) => {
    if (!meshRef.current) return;
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;
    
    const time = state.clock.elapsedTime;
    const cycleTime = 3;
    const sweepProgress = (time % cycleTime) / cycleTime;
    const sweepX = -25 + sweepProgress * 50;
    
    const colorTransitionProgress = Math.max(0, (scrollProgress - 0.25) / 0.25);
    const dissolutionProgress = Math.max(0, (scrollProgress - 0.5) / 0.25);
    const fadeOutProgress = Math.max(0, (scrollProgress - 0.75) / 0.25);
    
    const matrix = new THREE.Matrix4();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    
    buildings.forEach((building) => {
      const currentColor = new THREE.Color(building.baseColor);
      if (scrollProgress >= 0.25) {
        const targetColor = new THREE.Color(building.targetColor);
        currentColor.lerp(targetColor, Math.min(1, colorTransitionProgress));
      }
      if (scrollProgress < 0.25) {
        const distToSweep = Math.abs(building.position[0] - sweepX);
        if (distToSweep < 2) {
          currentColor.lerp(new THREE.Color('#00f0ff'), 1 - distToSweep / 2);
        }
      }
      
      if (scrollProgress > 0.5 && building.rank <= 20) {
        building.dissolutionProgress = Math.min(1, dissolutionProgress);
      } else {
        building.dissolutionProgress = 0;
      }
      
      const s = 1 - (building.rank <= 20 ? building.dissolutionProgress : 0);
      scale.set(
        1 * s, 
        building.originalHeight * (1 - (building.rank <= 20 ? building.dissolutionProgress * 0.8 : 0)), 
        1 * s
      );
      
      position.set(...building.position);
      if (fadeOutProgress > 0) {
        position.y -= fadeOutProgress * 10;
      }
      
      matrix.compose(position, quaternion, scale);
      meshRef.current!.setMatrixAt(building.index, matrix);
      
      const finalColor = currentColor.clone();
      if (fadeOutProgress > 0) {
        finalColor.lerp(new THREE.Color('#000000'), fadeOutProgress);
      }
      meshRef.current!.setColorAt(building.index, finalColor);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} frustumCulled={true}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial wireframe vertexColors />
    </instancedMesh>
  );
}

// Enhanced Camera Controller Component
function CameraController() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const targetBuildingPos = useScrollStore((state) => state.targetBuildingPosition);
  const { camera } = useThree();
  
  useFrame(() => {
    let targetPosition: [number, number, number];
    let targetLookAt: [number, number, number];
    
    if (scrollProgress < 0.25) {
      const time = performance.now() * 0.001;
      targetPosition = [
        Math.sin(time * Math.PI * 2 * 0.1) * 20,
        5 + Math.sin(time * 4) * 2,
        Math.cos(time * Math.PI * 2 * 0.1) * 20
      ];
      targetLookAt = [0, 2, 0];
    } else if (scrollProgress < 0.5) {
      const zoomProgress = (scrollProgress - 0.25) / 0.25;
      const easeProgress = zoomProgress * zoomProgress * (3 - 2 * zoomProgress);
      targetPosition = [
        targetBuildingPos[0] + 10 - easeProgress * 8, 
        targetBuildingPos[1] + 5 - easeProgress * 2,
        targetBuildingPos[2] + 15 - easeProgress * 10
      ];
      targetLookAt = [targetBuildingPos[0], targetBuildingPos[1], targetBuildingPos[2]];
    } else if (scrollProgress < 0.75) {
      const closeProgress = (scrollProgress - 0.5) / 0.25;
      const easeProgress = closeProgress * closeProgress * (3 - 2 * closeProgress);
      targetPosition = [
        targetBuildingPos[0] + 2 - easeProgress * 1,
        targetBuildingPos[1] + 3 - easeProgress * 1,
        targetBuildingPos[2] + 5 - easeProgress * 3
      ];
      targetLookAt = [targetBuildingPos[0], targetBuildingPos[1] + 1, targetBuildingPos[2]];
    } else {
      const infraProgress = (scrollProgress - 0.75) / 0.25;
      const easeProgress = infraProgress * infraProgress * (3 - 2 * infraProgress);
      targetPosition = [
        15 + easeProgress * 10,
        8 + easeProgress * 4,
        20 + easeProgress * 15
      ];
      targetLookAt = [0, 0, 0];
    }
    
    camera.position.lerp(new THREE.Vector3(...targetPosition), 0.02);
    camera.lookAt(...targetLookAt);
    
    const targetFov = scrollProgress < 0.25 ? 60 : 
                     scrollProgress < 0.5 ? 50 :
                     scrollProgress < 0.75 ? 40 : 45;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.02);
    camera.updateProjectionMatrix();
  });
  
  return null;
}

// Data Flow Particles Component
function DataFlow() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const targetBuildingPos = useScrollStore((state) => state.targetBuildingPosition);
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1000;
  
  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initialPos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 10;
      const z = (Math.random() - 0.5) * 40;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      initialPos[i * 3] = x;
      initialPos[i * 3 + 1] = y;
      initialPos[i * 3 + 2] = z;
    }
    return [pos, initialPos];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || scrollProgress < 0.4) return;
    const time = state.clock.elapsedTime;
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const dissolutionProgress = Math.max(0, (scrollProgress - 0.5) / 0.25);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (scrollProgress < 0.75) {
        // Dissolution: Flow from initial positions towards target building
        const t = Math.min(1, dissolutionProgress * 1.5);
        positionsAttr.array[i3] = initialPositions[i3] + (targetBuildingPos[0] - initialPositions[i3]) * t + Math.sin(time + i) * 0.2;
        positionsAttr.array[i3 + 1] = initialPositions[i3 + 1] + (targetBuildingPos[1] - initialPositions[i3 + 1]) * t + Math.cos(time + i * 0.5) * 0.2;
        positionsAttr.array[i3 + 2] = initialPositions[i3 + 2] + (targetBuildingPos[2] - initialPositions[i3 + 2]) * t + Math.sin(time * 0.5 + i) * 0.2;
      } else {
        // Infrastructure: Flow towards network icons
        const targetX = i % 2 === 0 ? -8 : 8;
        const targetY = i % 2 === 0 ? 5 : 3;
        const targetZ = 0;
        positionsAttr.array[i3] += (targetX - positionsAttr.array[i3]) * 0.02;
        positionsAttr.array[i3 + 1] += (targetY - positionsAttr.array[i3 + 1]) * 0.02;
        positionsAttr.array[i3 + 2] += (targetZ - positionsAttr.array[i3 + 2]) * 0.02;
      }
    }
    positionsAttr.needsUpdate = true;
  });

  if (scrollProgress < 0.4) return null;
  const opacity = scrollProgress < 0.5 ? (scrollProgress - 0.4) * 10 : 1;
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#00f0ff" transparent opacity={opacity * 0.6} sizeAttenuation={true} />
    </points>
  );
}

// Network Mesh Component with enhanced visuals
function NetworkMesh() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  if (scrollProgress < 0.75) return null;
  const networkProgress = (scrollProgress - 0.75) / 0.25;
  const easeProgress = networkProgress * networkProgress * (3 - 2 * networkProgress);
  
  return (
    <group>
      <mesh position={[-8, 5, 0]}>
        <sphereGeometry args={[2, 12, 8]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={easeProgress * 0.8} wireframe />
      </mesh>
      <mesh position={[8, 3, 0]}>
        <boxGeometry args={[3, 2, 1]} />
        <meshBasicMaterial color="#f43f5e" transparent opacity={easeProgress * 0.8} wireframe />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                -8, 5 + i * 0.5, (i - 2) * 0.5,
                8, 3 + i * 0.3, (i - 2) * 0.3 
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00f0ff" transparent opacity={easeProgress * (0.8 - i * 0.1)} />
        </line>
      ))}
    </group>
  );
}

// Scene content component that includes all 3D elements
function SceneContent() {
  const buildingData = useScrollStore((state) => state.buildingData);
  
  return (
    <>
      <CameraController />
      <BuildingsGrid />
      <ParticleFlow buildingPositions={buildingData} />
      <ScannerSweep />
      <DataFlow />
      <NetworkMesh />
    </>
  );
}

// Main CityScanner Component with Error Handling
export default function CityScanner({ children }: { children?: React.ReactNode }) {
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);
  const [webglSupported, setWebglSupported] = useState(true);
  
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch { setWebglSupported(false); }
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? scrollTop / documentHeight : 0;
      setScrollProgress(progress);
    };
    
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [setScrollProgress]);

  if (!webglSupported) {
    return (
      <div className="fixed inset-0 bg-void flex items-center justify-center">
        <div className="text-center text-zinc-300">
          <h3 className="text-xl mb-2">WebGL Not Supported</h3>
          <p className="text-sm text-zinc-400">Your browser doesn&apos;t support WebGL required for 3D rendering</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <ThreeErrorBoundary>
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 5, 15], fov: 60 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ position: 'absolute', inset: 0 }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <ScrollControls speed={1} damping={0.1}>
              <SceneContent />
            </ScrollControls>
          </Suspense>
        </Canvas>
        <PerformanceMonitor />
      </div>
      <div className="relative z-10">{children}</div>
    </ThreeErrorBoundary>
  );
}
