// src/store/useWallet.ts
// Your UniRide Wallet. Saved to the phone.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WalletEntry = {
  id: string;
  kind: 'keke' | 'cab' | 'topup' | 'refund';
  title: string;
  detail: string;
  amount: number; // positive = in, negative = out
  at: number;
};

const at = (days: number, hour: number, minute: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
};

const examples: WalletEntry[] = [
  { id: 'w4', kind: 'cab', title: 'Cab ride', detail: 'To Bodija Market', amount: -800, at: at(1, 14, 10) },
  { id: 'w3', kind: 'topup', title: 'Wallet top-up', detail: 'Visa •••• 4417', amount: 2000, at: at(5, 10, 0) },
  { id: 'w2', kind: 'refund', title: 'Refund', detail: 'Cancelled ride', amount: 300, at: at(16, 8, 6) },
  { id: 'w1', kind: 'keke', title: 'Keke ride', detail: 'To Kenneth Mellanby Hall', amount: -300, at: at(19, 18, 30) },
];
const STARTING_BALANCE = 2450;

type WalletState = {
  balance: number;
  activity: WalletEntry[];
  add: (entry: Omit<WalletEntry, 'id' | 'at'>) => void;
  reset: () => void;
};

export const useWallet = create<WalletState>()(
  persist(
    (set) => ({
      balance: STARTING_BALANCE,
      activity: examples,
      add: (entry) =>
        set((state) => ({
          balance: state.balance + entry.amount,
          activity: [{ ...entry, id: String(Date.now()), at: Date.now() }, ...state.activity],
        })),
      reset: () => set({ balance: STARTING_BALANCE, activity: examples }),
    }),
    { name: 'uniride-wallet', storage: createJSONStorage(() => AsyncStorage) }
  )
);