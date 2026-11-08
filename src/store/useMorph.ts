// src/store/useMorph.ts
// Coordinates the "banner ⇄ full-screen tracking" morph.
// Screens ask for an open or close; the <TripMorph /> overlay does the animation and navigation.
import { create } from 'zustand';
import { router } from 'expo-router';

export type Rect = { x: number; y: number; width: number; height: number };

type Job =
  | { kind: 'open'; from: Rect | null; radius: number; showBanner: boolean; go: () => void }
  | { kind: 'close'; leave: () => void };

type MorphState = {
  bannerRect: Rect | null; // where the banner was last drawn
  job: Job | null;
  setBannerRect: (rect: Rect) => void;
  openTrip: (options?: { from?: Rect; radius?: number; showBanner?: boolean; go?: () => void }) => void;
  closeTrip: (leave: () => void) => void;
  done: () => void;
};

// The `morph` param tells the trip screen to appear with no animation of its own:
// the morph card is already doing the animating.
export const goToTrip = () => router.push({ pathname: '/trip', params: { morph: '1' } });

export const useMorph = create<MorphState>((set, get) => ({
  bannerRect: null,
  job: null,
  setBannerRect: (rect) => set({ bannerRect: rect }),

  openTrip: (options = {}) => {
    if (get().job) return; // already animating: ignore double taps
    set({
      job: {
        kind: 'open',
        from: options.from ?? null, // null = start from the banner
        radius: options.radius ?? 20,
        showBanner: options.showBanner ?? true,
        go: options.go ?? goToTrip,
      },
    });
  },

  closeTrip: (leave) => {
    if (get().job) return;
    set({ job: { kind: 'close', leave } });
  },

  done: () => set({ job: null }),
}));