'use client';

import React, { useRef, useMemo, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/scrollStore';
import ParticleFlow from './ParticleFlow';

interface Building {
  index: number;
  position: [number, number, number];
  height: number;
  baseColor: string;
  targetColor: string;
  currentColor: string;
  rank: number;
  originalHeight: number;
  dissolutionProgress: number;
}

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

function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const tick = () => {
      frameCount.current++;
      const currentTime = performance.now();
      if (currentTime - lastTime.current >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / (currentTime - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-16 z-50 text-xs text-zinc-400 bg-black bg-opacity-50 px-2 py-1 rounded">
      FPS: {fps}
    </div>
  );
}

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

function BuildingGlows({ buildings }: { buildings: Building[] }) {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const frameCount = useRef(0);

  const topBuildings = useMemo(() => buildings.filter(b => b.rank <= 20), [buildings]);

  useFrame((state) => {
    if (!meshRef.current) return;
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;

    if (scrollProgress < 0.25 || scrollProgress > 0.75) {
      for (let i = 0; i < topBuildings.length; i++) {
        const m = new THREE.Matrix4();
        m.makeScale(0, 0, 0);
        meshRef.current.setMatrixAt(i, m);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      return;
    }

    const colorProgress = Math.max(0, (scrollProgress - 0.25) / 0.25);
    const time = state.clock.elapsedTime;
    const matrix = new THREE.Matrix4();

    topBuildings.forEach((building, i) => {
      const pulse = 0.85 + Math.sin(time * 2 + i * 0.7) * 0.15;
      const glowScale = colorProgress * pulse;
      const glowHeight = building.originalHeight * 1.05 * colorProgress;

      matrix.compose(
        new THREE.Vector3(...building.position),
        new THREE.Quaternion(),
        new THREE.Vector3(1.3 * glowScale, glowHeight, 1.3 * glowScale)
      );
      meshRef.current!.setMatrixAt(i, matrix);

      const isTop3 = building.rank <= 3;
      const glowColor = new THREE.Color(isTop3 ? '#f43f5e' : '#00f0ff');
      glowColor.multiplyScalar(colorProgress * 0.4);
      meshRef.current!.setColorAt(i, glowColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  if (scrollProgress < 0.25 || scrollProgress > 0.75) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, topBuildings.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        transparent
        opacity={0.08}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

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
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} frustumCulled={true}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial wireframe vertexColors />
      </instancedMesh>
      <BuildingGlows buildings={buildings} />
    </>
  );
}

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
    const perspCamera = camera as THREE.PerspectiveCamera;
    perspCamera.fov = THREE.MathUtils.lerp(perspCamera.fov, targetFov, 0.02);
    perspCamera.updateProjectionMatrix();
  });

  return null;
}

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
        const t = Math.min(1, dissolutionProgress * 1.5);
        positionsAttr.array[i3] = initialPositions[i3] + (targetBuildingPos[0] - initialPositions[i3]) * t + Math.sin(time + i) * 0.2;
        positionsAttr.array[i3 + 1] = initialPositions[i3 + 1] + (targetBuildingPos[1] - initialPositions[i3 + 1]) * t + Math.cos(time + i * 0.5) * 0.2;
        positionsAttr.array[i3 + 2] = initialPositions[i3 + 2] + (targetBuildingPos[2] - initialPositions[i3 + 2]) * t + Math.sin(time * 0.5 + i) * 0.2;
      } else {
        const nodeIndex = i % NETWORK_NODES.length;
        const targetX = NETWORK_NODES[nodeIndex][0];
        const targetY = NETWORK_NODES[nodeIndex][1];
        const targetZ = NETWORK_NODES[nodeIndex][2];
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
      <pointsMaterial
        size={0.08}
        color="#00f0ff"
        transparent
        opacity={opacity * 0.5}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

const NETWORK_NODES: [number, number, number][] = [
  [-8, 5, 0],
  [8, 3, 0],
  [0, 7, -5],
  [-4, 2, 4],
  [5, 6, 3],
];

const NODE_COLORS = ['#00f0ff', '#f43f5e', '#00f0ff', '#a78bfa', '#00f0ff'];
const NODE_SIZES = [2, 3, 1.5, 1.2, 1.8];

function NetworkNode({ position, color, size, progress, index }: {
  position: [number, number, number];
  color: string;
  size: number;
  progress: number;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    meshRef.current.rotation.x = time * 0.3 + index * 0.5;
    meshRef.current.rotation.y = time * 0.4 + index * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position}>
      {index % 2 === 0
        ? <sphereGeometry args={[size * 0.5, 12, 8]} />
        : <boxGeometry args={[size * 0.7, size * 0.5, size * 0.4]} />
      }
      <meshBasicMaterial color={color} transparent opacity={progress * 0.85} wireframe />
    </mesh>
  );
}

function NetworkMesh() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  if (scrollProgress < 0.75) return null;

  const networkProgress = (scrollProgress - 0.75) / 0.25;
  const easeProgress = networkProgress * networkProgress * (3 - 2 * networkProgress);

  // Build all connection pairs
  const connections: [number, number][] = [];
  for (let i = 0; i < NETWORK_NODES.length; i++) {
    for (let j = i + 1; j < NETWORK_NODES.length; j++) {
      connections.push([i, j]);
    }
  }

  return (
    <group>
      {NETWORK_NODES.map((pos, i) => (
        <NetworkNode
          key={i}
          position={pos}
          color={NODE_COLORS[i]}
          size={NODE_SIZES[i]}
          progress={easeProgress}
          index={i}
        />
      ))}

      {connections.map(([a, b], i) => {
        const nodeA = NETWORK_NODES[a];
        const nodeB = NETWORK_NODES[b];
        const distFactor = 1 - (i / connections.length) * 0.5;
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([...nodeA, ...nodeB])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#00f0ff"
              transparent
              opacity={easeProgress * 0.5 * distFactor}
            />
          </line>
        );
      })}

      <AnimatedNetworkParticles nodes={NETWORK_NODES} progress={easeProgress} />
    </group>
  );
}

function AnimatedNetworkParticles({ nodes, progress }: { 
  nodes: [number, number, number][];
  progress: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200;
  const nodeAssignments = useRef<number[]>([]);
  const particleLifes = useRef<Float32Array>(new Float32Array(count));
  const particleSpeeds = useRef<Float32Array>(new Float32Array(count));

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const assignments: number[] = [];
    for (let i = 0; i < count; i++) {
      const nodeIdx = i % nodes.length;
      assignments.push(nodeIdx);
      const n = nodes[nodeIdx];
      pos[i * 3] = n[0] + (Math.random() - 0.5) * 3;
      pos[i * 3 + 1] = n[1] + (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = n[2] + (Math.random() - 0.5) * 3;
      particleLifes.current[i] = Math.random();
      particleSpeeds.current[i] = 0.3 + Math.random() * 0.7;
    }
    nodeAssignments.current = assignments;
    return pos;
  }, [nodes]);

  useFrame((_, delta) => {
    if (!pointsRef.current || progress < 0.1) return;
    const posAttr = pointsRef.current.geometry.attributes.position;

    for (let i = 0; i < count; i++) {
      particleLifes.current[i] += delta * particleSpeeds.current[i];
      if (particleLifes.current[i] > 1) {
        particleLifes.current[i] = 0;
        const srcIdx = nodeAssignments.current[i];
        const dstIdx = (srcIdx + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length;
        nodeAssignments.current[i] = dstIdx;
      }

      const srcNode = nodes[nodeAssignments.current[i]];
      const dstIdx = (nodeAssignments.current[i] + 1) % nodes.length;
      const dstNode = nodes[dstIdx];
      const t = particleLifes.current[i];

      posAttr.array[i * 3] = srcNode[0] + (dstNode[0] - srcNode[0]) * t;
      posAttr.array[i * 3 + 1] = srcNode[1] + (dstNode[1] - srcNode[1]) * t + Math.sin(t * Math.PI) * 1.5;
      posAttr.array[i * 3 + 2] = srcNode[2] + (dstNode[2] - srcNode[2]) * t;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#00f0ff"
        transparent
        opacity={progress * 0.8}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

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
            <ScrollControls pages={1} damping={0.1}>
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
