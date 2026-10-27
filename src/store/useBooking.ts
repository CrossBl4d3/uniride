// src/store/useBooking.ts
// The ride being planned. It lives across Plan route → Choose a ride → Confirm & pay.
import { create } from 'zustand';
import { Place, currentLocation } from '../data/places';

type BookingState = {
  pickup: Place;
  destination: Place | null;
  setPickup: (place: Place) => void;
  setDestination: (place: Place) => void;
  swap: () => void;
  reset: () => void;
};

export const useBooking = create<BookingState>((set, get) => ({
  pickup: currentLocation,
  destination: null,

  setPickup: (place) => set({ pickup: place }),
  setDestination: (place) => set({ destination: place }),

  // get() reads the current values from inside the store.
  swap: () => {
    const { pickup, destination } = get();
    if (!destination) return; // nothing to swap with yet
    set({ pickup: destination, destination: pickup });
  },

  reset: () => set({ pickup: currentLocation, destination: null }),
}));