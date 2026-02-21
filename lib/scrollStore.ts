import { create } from 'zustand';

export type ScrollStage = 'Hero' | 'Hunt' | 'Audit' | 'Ghost' | 'Infrastructure';

interface BuildingData {
  position: [number, number, number];
  rank: number;
  targetColor: string;
}

interface ScrollState {
  scrollProgress: number; // 0-1
  currentStage: ScrollStage;
  isScrolling: boolean;
  targetBuildingPosition: [number, number, number];
  buildingData: BuildingData[];
  setScrollProgress: (progress: number) => void;
  setCurrentStage: (stage: ScrollStage) => void;
  setIsScrolling: (scrolling: boolean) => void;
  setTargetBuildingPosition: (pos: [number, number, number]) => void;
  setBuildingData: (data: BuildingData[]) => void;
}

export const useScrollStore = create<ScrollState>((set, get) => ({
  scrollProgress: 0,
  currentStage: 'Hero',
  isScrolling: false,
  targetBuildingPosition: [0, 0, 0],
  buildingData: [],
  
  setScrollProgress: (progress: number) => {
    const normalizedProgress = Math.max(0, Math.min(1, progress));
    set({ scrollProgress: normalizedProgress });
    
    // Update current stage based on scroll progress
    let stage: ScrollStage;
    if (normalizedProgress < 0.25) {
      stage = 'Hero';
    } else if (normalizedProgress < 0.5) {
      stage = 'Hunt';
    } else if (normalizedProgress < 0.75) {
      stage = 'Audit';
    } else if (normalizedProgress < 0.9) {
      stage = 'Ghost';
    } else {
      stage = 'Infrastructure';
    }
    
    if (stage !== get().currentStage) {
      set({ currentStage: stage });
    }
  },
  
  setCurrentStage: (stage: ScrollStage) => set({ currentStage: stage }),
  setIsScrolling: (scrolling: boolean) => set({ isScrolling: scrolling }),
  setTargetBuildingPosition: (pos: [number, number, number]) => set({ targetBuildingPosition: pos }),
  setBuildingData: (data: BuildingData[]) => set({ buildingData: data }),
}));