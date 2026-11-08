// src/store/useUI.ts
// App-wide UI state that isn't saved to the phone.
import { create } from 'zustand';
import { Place } from '../data/places';

type UIState = {
  sheetExpanded: boolean;
  setSheetExpanded: (expanded: boolean) => void;

  // The pin screen (in "save" mode) leaves its result here for Add a place to pick up.
  pickedPlace: Place | null;
  setPickedPlace: (place: Place | null) => void;

  // Development only: pretend the phone is offline, to test the offline screen.
  simulateOffline: boolean;
  setSimulateOffline: (on: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  sheetExpanded: false,
  setSheetExpanded: (expanded) => set({ sheetExpanded: expanded }),

  pickedPlace: null,
  setPickedPlace: (place) => set({ pickedPlace: place }),

  simulateOffline: false,
  setSimulateOffline: (on) => set({ simulateOffline: on }),
}));