// Enhanced Buildings Grid Component with optimizations
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollStore } from '@/lib/scrollStore';

// Building interface
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

export function BuildingsGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const setTargetBuildingPosition = useScrollStore((state) => state.setTargetBuildingPosition);
  const frameCount = useRef(0);
  
  // Generate building data with optimized memory usage
  const buildings = useMemo(() => {
    const buildingData: Building[] = [];
    const gridX = 25;
    const gridZ = 20; // 25x20 = 500 buildings
    const spacing = 2;
    const offsetX = (gridX - 1) / 2;
    const offsetZ = (gridZ - 1) / 2;
    
    for (let x = 0; x < gridX; x++) {
      for (let z = 0; z < gridZ; z++) {
        const posX = (x - offsetX) * spacing;
        const posZ = (z - offsetZ) * spacing;
        // Deterministic height for camera targeting
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

  useEffect(() => {
    // Pick the building with rank 10 as the target
    const target = buildings.find(b => b.rank === 10);
    if (target) {
      setTargetBuildingPosition(target.position);
    }
  }, [buildings, setTargetBuildingPosition]);

  // Optimized color transition and animation logic
  useFrame((state) => {
    if (!meshRef.current) return;
    
    frameCount.current++;
    
    // Only update every 2 frames for performance
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
      // Smooth color interpolation
      const currentColor = new THREE.Color(building.baseColor);
      
      if (scrollProgress >= 0.25) {
        const targetColor = new THREE.Color(building.targetColor);
        currentColor.lerp(targetColor, Math.min(1, colorTransitionProgress));
      }
      
      // Scanner sweep highlight
      if (scrollProgress < 0.25) {
        const distToSweep = Math.abs(building.position[0] - sweepX);
        if (distToSweep < 2) {
          currentColor.lerp(new THREE.Color('#00f0ff'), 1 - distToSweep / 2);
        }
      }
      
      // Update building state
      building.currentColor = `#${currentColor.getHexString()}`;
      
      // Dissolution effect
      if (scrollProgress > 0.5 && building.rank <= 20) {
        building.dissolutionProgress = Math.min(1, dissolutionProgress);
      } else {
        building.dissolutionProgress = 0;
      }
      
      // Update instance matrix
      const s = 1 - (building.rank <= 20 ? building.dissolutionProgress : 0);
      
      scale.set(
        1 * s, 
        building.originalHeight * (1 - (building.rank <= 20 ? building.dissolutionProgress * 0.8 : 0)), 
        1 * s
      );
      
      position.set(...building.position);
      // Move buildings down as they fade out
      if (fadeOutProgress > 0) {
        position.y -= fadeOutProgress * 10;
      }
      
      matrix.compose(position, quaternion, scale);
      meshRef.current!.setMatrixAt(building.index, matrix);
      
      // Set color for this instance
      const finalColor = currentColor.clone();
      if (fadeOutProgress > 0) {
        // Fade to dark gray
        finalColor.lerp(new THREE.Color('#000000'), fadeOutProgress);
      }
      meshRef.current!.setColorAt(building.index, finalColor);
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
