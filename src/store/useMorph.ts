// src/store/useMorph.ts
// Coordinates the "banner ⇄ full-screen trip" morph.
// The trip screens themselves do the animating (see components/MorphScreen.tsx);
// this store just passes them the information they need.
import { create } from 'zustand';
import { router } from 'expo-router';

export type Rect = { x: number; y: number; width: number; height: number };

// Where a morphing screen starts growing from.
export type Origin = {
  rect: Rect;
  radius: number;
  fromBanner: boolean; // true = grow out of the live-trip banner
  tint?: string;       // a colour to fade out of (e.g. the green Pay button)
};

export type TripHref = '/trip' | '/trip/rate' | '/trip/no-drivers';

type MorphState = {
  bannerRect: Rect | null; // where the banner is drawn (window coordinates)
  stripHeight: number;     // height of the whole banner strip, status bar included
  pending: Origin | null;  // handed to the next trip screen that opens
  keepBanner: boolean;     // keep drawing the real banner even on a trip screen (hides 1-frame gaps)
  underBanner: boolean;    // is the screen BEHIND the trip screen one that shows the banner?
  closeRequested: boolean; // "shrink back into the banner as soon as you're visible again"
  busy: boolean;           // an open is in progress: ignore double taps

  setBannerRect: (rect: Rect) => void;
  setStripHeight: (height: number) => void;
  setKeepBanner: (keep: boolean) => void;
  openTrip: (options?: { href?: TripHref; from?: Rect; radius?: number; tint?: string }) => void;
  takeOrigin: () => Origin | null;
  finishOpen: () => void;
  requestClose: () => void;
  clearCloseRequest: () => void;
};

let busyTimer: ReturnType<typeof setTimeout> | null = null;

export const useMorph = create<MorphState>((set, get) => ({
  bannerRect: null,
  stripHeight: 0,
  pending: null,
  keepBanner: false,
  underBanner: true,
  closeRequested: false,
  busy: false,

  setBannerRect: (rect) => set({ bannerRect: rect }),
  setStripHeight: (height) => set({ stripHeight: height }),
  setKeepBanner: (keep) => set({ keepBanner: keep }),

  // Open a trip screen. With `from`, it grows out of that rectangle (e.g. the Pay button);
  // without it, it grows out of the banner.
  openTrip: (options = {}) => {
    if (get().busy) return;
    const { href = '/trip', from, radius, tint } = options;
    const banner = get().bannerRect;

    const origin: Origin | null = from
      ? { rect: from, radius: radius ?? from.height / 2, fromBanner: false, tint }
      : banner
      ? { rect: banner, radius: 20, fromBanner: true }
      : null;

    set({
      pending: origin,
      busy: true,
      keepBanner: !!origin?.fromBanner, // the real banner stays until the trip screen is drawn
      underBanner: !from,               // opened from Pay = the booking screen is behind, no banner there
    });
    router.push(href);

    // Safety net: never stay "busy" forever if something interrupts the animation.
    if (busyTimer) clearTimeout(busyTimer);
    busyTimer = setTimeout(() => set({ busy: false, keepBanner: false }), 1500);
  },

  // A trip screen calls this once, as it appears, to find out where to grow from.
  takeOrigin: () => {
    const origin = get().pending;
    set({ pending: null });
    return origin;
  },

  finishOpen: () => set({ busy: false, keepBanner: false, underBanner: true }),

  requestClose: () => set({ closeRequested: true }),
  clearCloseRequest: () => set({ closeRequested: false }),
}));