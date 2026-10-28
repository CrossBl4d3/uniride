// src/store/useSafety.ts
// Trusted contacts and safety preferences. Saved to the phone.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  everyTrip: boolean; // gets a link to every trip automatically
};

const examples: Contact[] = [
  { id: 'mum', name: 'Mum', phone: '+234 805 112 3344', everyTrip: true },
  { id: 'ade', name: 'Ade (roommate)', phone: '+234 816 900 2210', everyTrip: false },
];

type SafetyState = {
  contacts: Contact[];
  shareTrips: boolean;
  tripPin: boolean;
  setShareTrips: (on: boolean) => void;
  setTripPin: (on: boolean) => void;
  addContact: (name: string, phone: string) => void;
  removeContact: (id: string) => void;
  reset: () => void;
};

const initial = { contacts: examples, shareTrips: true, tripPin: true };

export const useSafety = create<SafetyState>()(
  persist(
    (set) => ({
      ...initial,
      setShareTrips: (on) => set({ shareTrips: on }),
      setTripPin: (on) => set({ tripPin: on }),
      addContact: (name, phone) =>
        set((state) => ({
          contacts: [...state.contacts, { id: String(Date.now()), name, phone, everyTrip: false }],
        })),
      removeContact: (id) => set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),
      reset: () => set(initial),
    }),
    { name: 'uniride-safety', storage: createJSONStorage(() => AsyncStorage) }
  )
);