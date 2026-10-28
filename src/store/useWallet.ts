// src/store/useWallet.ts
// Your UniRide Wallet: the balance and every movement of money in or out.
import { create } from 'zustand';

export type WalletEntry = {
  id: string;
  kind: 'keke' | 'cab' | 'topup' | 'refund';
  title: string;  // "Keke ride", "Wallet top-up", "Refund"
  detail: string; // "To First Bank, UI Branch", "Visa •••• 4417"
  amount: number; // positive = money in, negative = money out
  at: number;     // when (ms)
};

const at = (days: number, hour: number, minute: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
};

// Example history that matches the example rides in useRides.
const examples: WalletEntry[] = [
  { id: 'w4', kind: 'cab', title: 'Cab ride', detail: 'To Bodija Market', amount: -800, at: at(1, 14, 10) },
  { id: 'w3', kind: 'topup', title: 'Wallet top-up', detail: 'Visa •••• 4417', amount: 2000, at: at(5, 10, 0) },
  { id: 'w2', kind: 'refund', title: 'Refund', detail: 'Cancelled ride', amount: 300, at: at(16, 8, 6) },
  { id: 'w1', kind: 'keke', title: 'Keke ride', detail: 'To Kenneth Mellanby Hall', amount: -300, at: at(19, 18, 30) },
];

type WalletState = {
  balance: number;
  activity: WalletEntry[]; // newest first
  // Omit<...> = "a WalletEntry, minus these fields": the store fills in id and time itself.
  add: (entry: Omit<WalletEntry, 'id' | 'at'>) => void;
};

export const useWallet = create<WalletState>((set) => ({
  balance: 2450,
  activity: examples,

  // ONE action for money in and out: the sign of `amount` decides which.
  add: (entry) =>
    set((state) => ({
      balance: state.balance + entry.amount,
      activity: [{ ...entry, id: String(Date.now()), at: Date.now() }, ...state.activity],
    })),
}));