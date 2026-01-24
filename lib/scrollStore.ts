import { create } from 'zustand';

export type ScrollStage = 'Hero' | 'Hunt' | 'Audit' | 'Ghost' | 'Infrastructure';

interface ScrollState {
  scrollProgress: number; // 0-1
  currentStage: ScrollStage;
  isScrolling: boolean;
  setScrollProgress: (progress: number) => void;
  setCurrentStage: (stage: ScrollStage) => void;
  setIsScrolling: (scrolling: boolean) => void;
}

export const useScrollStore = create<ScrollState>((set, get) => ({
  scrollProgress: 0,
  currentStage: 'Hero',
  isScrolling: false,
  
  setScrollProgress: (progress: number) => {
    const normalizedProgress = Math.max(0, Math.min(1, progress));
    set({ scrollProgress: normalizedProgress });
    
    // Update current stage based on scroll progress
    let stage: ScrollStage;
    if (normalizedProgress < 0.2) {
      stage = 'Hero';
    } else if (normalizedProgress < 0.4) {
      stage = 'Hunt';
    } else if (normalizedProgress < 0.6) {
      stage = 'Audit';
    } else if (normalizedProgress < 0.8) {
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
}));