// src/store/usePlaces.ts
// Your saved places (Hall, Faculty…). Saved to the phone.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconName } from '../components/Icon';
import { Place, savedPlaces, searchablePlaces } from '../data/places';

export type SavedPlace = {
  label: string; // what YOU call it: "Hall"
  icon: IconName;
  place: Place;  // where it really is: Kenneth Mellanby Hall
};

const library = searchablePlaces.find((p) => p.id === 'kdl')!; // ! = "trust me, this exists"
const examples: SavedPlace[] = [...savedPlaces, { label: 'Library', icon: 'pin', place: library }];

type PlacesState = {
  saved: SavedPlace[];
  add: (place: SavedPlace) => void;
  remove: (label: string) => void;
  reset: () => void;
};

export const usePlaces = create<PlacesState>()(
  persist(
    (set) => ({
      saved: examples,
      add: (place) => set((state) => ({ saved: [...state.saved, place] })),
      remove: (label) => set((state) => ({ saved: state.saved.filter((s) => s.label !== label) })),
      reset: () => set({ saved: examples }),
    }),
    { name: 'uniride-places', storage: createJSONStorage(() => AsyncStorage) }
  )
);