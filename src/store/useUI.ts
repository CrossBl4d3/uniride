// src/store/useUI.ts
// App-wide UI flags. The tab bar reads this to know when to hide.
import { create } from 'zustand';

type UIState = {
  sheetExpanded: boolean;
  setSheetExpanded: (expanded: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  sheetExpanded: false,
  setSheetExpanded: (expanded) => set({ sheetExpanded: expanded }),
}));