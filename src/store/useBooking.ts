// src/store/useBooking.ts
// The ride being planned. It lives across Plan route → Choose a ride → Confirm & pay.
import { create } from 'zustand';
import { Place, currentLocation } from '../data/places';
import { RideTypeId } from '../data/rides';

type BookingState = {
  pickup: Place;
  destination: Place | null;
  rideType: RideTypeId;
  setPickup: (place: Place) => void;
  setDestination: (place: Place) => void;
  setRideType: (ride: RideTypeId) => void;
  swap: () => void;
  reset: () => void;
};

export const useBooking = create<BookingState>((set, get) => ({
  pickup: currentLocation,
  destination: null,
  rideType: 'keke',

  setPickup: (place) => set({ pickup: place }),
  setDestination: (place) => set({ destination: place }),
  setRideType: (ride) => set({ rideType: ride }),

  swap: () => {
    const { pickup, destination } = get();
    if (!destination) return;
    set({ pickup: destination, destination: pickup });
  },

  reset: () => set({ pickup: currentLocation, destination: null, rideType: 'keke' }),
}));