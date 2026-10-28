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
};

export const useUI = create<UIState>((set) => ({
  sheetExpanded: false,
  setSheetExpanded: (expanded) => set({ sheetExpanded: expanded }),

  pickedPlace: null,
  setPickedPlace: (place) => set({ pickedPlace: place }),
}));