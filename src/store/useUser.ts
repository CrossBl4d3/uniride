// src/store/useUser.ts
// The signed-in user. Saved to the phone, so it survives restarts.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Profile = {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
};

type UserState = Profile & {
  campusId: string | null;
  signedIn: boolean; // true once onboarding is finished
  setProfile: (profile: Partial<Profile>) => void;
  setCampus: (id: string) => void;
  signIn: () => void;
  reset: () => void;
};

const initial = {
  phone: '',
  firstName: '',
  lastName: '',
  email: '',
  campusId: null as string | null,
  signedIn: false,
};

// create<UserState>()(...) — the extra () is needed when wrapping a store in middleware like persist.
export const useUser = create<UserState>()(
  persist(
    (set) => ({
      ...initial,
      setProfile: (profile) => set(profile),
      setCampus: (id) => set({ campusId: id }),
      signIn: () => set({ signedIn: true }),
      reset: () => set(initial),
    }),
    {
      name: 'uniride-user', // the key it's saved under on the phone
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);