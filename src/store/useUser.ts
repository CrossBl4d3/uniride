// src/store/useUser.ts
// Shared memory for the signed-in user. Any screen can read or update it.
import { create } from 'zustand';

type UserState = {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  campusId: string | null; // null = not chosen yet

  // "Actions": the only ways to change the data
  setProfile: (profile: Partial<Pick<UserState, 'phone' | 'firstName' | 'lastName' | 'email'>>) => void;
  setCampus: (id: string) => void;
};

export const useUser = create<UserState>((set) => ({
  phone: '',
  firstName: '',
  lastName: '',
  email: '',
  campusId: null,

  setProfile: (profile) => set(profile), // merges in only the fields you pass
  setCampus: (id) => set({ campusId: id }),
}));