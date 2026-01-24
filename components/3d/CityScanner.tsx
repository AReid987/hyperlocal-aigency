'use client';

import React, { useRef, useMemo, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/scrollStore';

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

  static getDerivedStateFromError(error: Error) {
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
  const { camera } = useThree();
  
  useFrame((state) => {
    if (scrollProgress > 0.25) return; // Only show in first 25%
    
    if (meshRef.current) {
      // Animate sweep position with smoother movement
      const time = state.clock.elapsedTime;
      meshRef.current.position.x = Math.sin(time * 0.5) * 25;
      meshRef.current.position.z = Math.cos(time * 0.3) * 25;
      
      // Add some rotation for visual interest
      meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.1;
    }
  });

  if (scrollProgress > 0.25) return null;

  return (
    <mesh ref={meshRef} position={[25, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial 
        color="#00f0ff" 
        transparent 
        opacity={0.1}
        wireframe 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Enhanced Buildings Grid Component with optimizations
function BuildingsGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const scroll = useScroll();
  const frameCount = useRef(0);
  
  // Generate building data with optimized memory usage
  const buildings = useMemo(() => {
    const buildingData: Building[] = [];
    const gridSize = 25; // 25x25 grid for 625 buildings
    const spacing = 2;
    const centerOffset = (gridSize - 1) / 2;
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const posX = (x - centerOffset) * spacing;
        const posZ = (z - centerOffset) * spacing;
        const height = Math.random() * 7 + 1; // Random height 1-8
        
        buildingData.push({
          index: x * gridSize + z,
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
    
    // Sort by height and assign ranks
    buildingData.sort((a, b) => b.originalHeight - a.originalHeight);
    buildingData.forEach((building, index) => {
      building.rank = index + 1;
      
      // Assign target colors based on rank
      if (index < 3) {
        building.targetColor = '#f43f5e'; // Red for top 3
      } else if (index < 20) {
        building.targetColor = '#00f0ff'; // Cyan for next 17
      } else {
        building.targetColor = '#333333'; // Gray for rest
      }
    });
    
    return buildingData;
  }, []);

  // Optimized color transition and animation logic
  useFrame(() => {
    if (!meshRef.current) return;
    
    frameCount.current++;
    
    // Only update every 2 frames for performance
    if (frameCount.current % 2 !== 0) return;
    
    const colorTransitionProgress = Math.max(0, (scrollProgress - 0.25) / 0.25);
    const dissolutionProgress = Math.max(0, (scrollProgress - 0.5) / 0.25);
    
    const matrix = new THREE.Matrix4();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    
    buildings.forEach((building) => {
      // Smooth color interpolation
      if (scrollProgress >= 0.25) {
        const baseColor = new THREE.Color(building.baseColor);
        const targetColor = new THREE.Color(building.targetColor);
        baseColor.lerp(targetColor, colorTransitionProgress);
        building.currentColor = `#${baseColor.getHexString()}`;
      } else {
        building.currentColor = building.baseColor;
      }
      
      // Dissolution effect for buildings in 50-75% scroll
      if (scrollProgress > 0.5 && building.rank <= 20) {
        building.dissolutionProgress = dissolutionProgress;
      } else {
        building.dissolutionProgress = 0;
      }
      
      // Update instance matrix
      scale.set(
        1, 
        building.originalHeight * (1 - building.dissolutionProgress * 0.3), 
        1
      );
      position.set(...building.position);
      matrix.compose(position, quaternion, scale);
      meshRef.current!.setMatrixAt(building.index, matrix);
      
      // Set color for this instance
      const color = new THREE.Color(building.currentColor);
      meshRef.current!.setColorAt(building.index, color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, buildings.length]}
      frustumCulled={true}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial wireframe vertexColors />
    </instancedMesh>
  );
}

// Enhanced Camera Controller Component
function CameraController() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const { camera } = useThree();
  
  useFrame(() => {
    // Camera positioning based on scroll progress with smooth transitions
    let targetPosition: [number, number, number];
    let targetLookAt: [number, number, number];
    
    if (scrollProgress < 0.25) {
      // Hero stage: Camera orbits around city center
      const time = performance.now() * 0.001;
      const orbitSpeed = 0.5;
      const heightVariation = 2 + Math.sin(time * 2) * 1;
      
      targetPosition = [
        Math.sin(time * Math.PI * 2 * orbitSpeed) * 20,
        5 + heightVariation,
        Math.cos(time * Math.PI * 2 * orbitSpeed) * 20
      ];
      targetLookAt = [0, 2, 0];
    } else if (scrollProgress < 0.5) {
      // Hunt stage: Start zooming into blue building
      const zoomProgress = (scrollProgress - 0.25) / 0.25;
      const easeProgress = zoomProgress * zoomProgress * (3 - 2 * zoomProgress); // Smooth step
      
      targetPosition = [
        10 - easeProgress * 8, // Move closer
        5 - easeProgress * 2,  // Lower height
        15 - easeProgress * 10 // Move forward
      ];
      targetLookAt = [0, 3, 0];
    } else if (scrollProgress < 0.75) {
      // Audit stage: Very close to specific building
      const closeProgress = (scrollProgress - 0.5) / 0.25;
      const easeProgress = closeProgress * closeProgress * (3 - 2 * closeProgress);
      
      targetPosition = [
        2 + easeProgress * 1,  // Very close to building
        4 + easeProgress * 1,  // Slightly above
        5 + easeProgress * 2   // Very close Z
      ];
      targetLookAt = [0, 3, 0];
    } else {
      // Infrastructure stage: Zoom back out for network view
      const infraProgress = (scrollProgress - 0.75) / 0.25;
      const easeProgress = infraProgress * infraProgress * (3 - 2 * infraProgress);
      
      targetPosition = [
        15 + easeProgress * 10, // Zoom out further
        8 + easeProgress * 4,   // Higher view
        20 + easeProgress * 15  // Further back
      ];
      targetLookAt = [0, 0, 0];
    }
    
    // Smooth camera movement with lerp
    camera.position.lerp(new THREE.Vector3(...targetPosition), 0.02);
    camera.lookAt(...targetLookAt);
    
    // Update camera FOV for dramatic effect
    const targetFov = scrollProgress < 0.25 ? 60 : 
                     scrollProgress < 0.5 ? 50 :
                     scrollProgress < 0.75 ? 40 : 45;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.02);
    camera.updateProjectionMatrix();
  });
  
  return null;
}

// Network Mesh Component with enhanced visuals
function NetworkMesh() {
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  
  if (scrollProgress < 0.75) return null;
  
  const networkProgress = (scrollProgress - 0.75) / 0.25;
  const easeProgress = networkProgress * networkProgress * (3 - 2 * networkProgress);
  
  return (
    <group>
      {/* Enhanced Cloud Icon */}
      <mesh position={[-8, 5, 0]}>
        <sphereGeometry args={[2, 12, 8]} />
        <meshBasicMaterial 
          color="#00f0ff" 
          transparent 
          opacity={easeProgress * 0.8}
          wireframe 
        />
      </mesh>
      
      {/* Enhanced Hardware Icon */}
      <mesh position={[8, 3, 0]}>
        <boxGeometry args={[3, 2, 1]} />
        <meshBasicMaterial 
          color="#f43f5e" 
          transparent 
          opacity={easeProgress * 0.8}
          wireframe 
        />
      </mesh>
      
      {/* Multiple Connection Lines */}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                -8, 5 + i * 0.5, (i - 2) * 0.5,  // Cloud position with variation
                8, 3 + i * 0.3, (i - 2) * 0.3    // Hardware position with variation
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color="#00f0ff" 
            transparent 
            opacity={easeProgress * (0.8 - i * 0.1)}
          />
        </line>
      ))}
      
      {/* Data Flow Particles */}
      {scrollProgress > 0.8 && (
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshBasicMaterial 
            color="#00f0ff" 
            transparent 
            opacity={easeProgress * 0.6}
          />
        </mesh>
      )}
    </group>
  );
}

// Main CityScanner Component with Error Handling
export default function CityScanner() {
  const setScrollProgress = useScrollStore((state) => state.setScrollProgress);
  const [webglSupported, setWebglSupported] = useState(true);
  
  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
      }
    } catch (e) {
      setWebglSupported(false);
    }
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / documentHeight;
      setScrollProgress(progress);
    };
    
    // Throttled scroll handler
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
    handleScroll(); // Initialize
    
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [setScrollProgress]);

  if (!webglSupported) {
    return (
      <div className="fixed inset-0 bg-void flex items-center justify-center">
        <div className="text-center text-zinc-300">
          <h3 className="text-xl mb-2">WebGL Not Supported</h3>
          <p className="text-sm text-zinc-400">
            Your browser doesn't support WebGL required for 3D rendering
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThreeErrorBoundary>
      <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <Canvas
          camera={{ position: [0, 5, 15], fov: 60 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false
          }}
          style={{ position: 'absolute', inset: 0 }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          performance={{ min: 0.8 }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            {/* Scroll Controls */}
            <ScrollControls speed={1} damping={0.1}>
              {/* Camera Controller */}
              <CameraController />
              
              {/* Buildings Grid */}
              <BuildingsGrid />
              
              {/* Scanner Sweep Effect */}
              <ScannerSweep />
              
              {/* Network Mesh */}
              <NetworkMesh />
            </ScrollControls>
          </Suspense>
        </Canvas>
        
        <PerformanceMonitor />
      </div>
    </ThreeErrorBoundary>
  );
}