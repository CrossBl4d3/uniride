// src/store/useCards.ts
// Your saved debit cards. Like real apps, we only keep the brand, last 4 digits and expiry,
// never the full number or CVV (those would live with the payment provider).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CardBrand = 'Visa' | 'Mastercard' | 'Verve';

export type Card = {
  id: string;
  brand: CardBrand;
  last4: string;
  expiry: string; // "08/28"
  name: string;
};

// The first digits of a card number tell you its brand.
export function brandOf(digits: string): CardBrand | null {
  if (/^(5060|5061|5078|5079|6500)/.test(digits)) return 'Verve'; // Nigerian cards; check before Mastercard
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  return null;
}

// The Luhn check: every real card number passes it, and almost every typo fails it.
export function passesLuhn(digits: string) {
  if (digits.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export const cardLabel = (c: Card) => `${c.brand} •••• ${c.last4}`;

const examples: Card[] = [{ id: 'visa-4417', brand: 'Visa', last4: '4417', expiry: '08/28', name: '' }];

type CardsState = {
  cards: Card[];
  defaultId: string | null;
  add: (card: Card) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  reset: () => void;
};

export const useCards = create<CardsState>()(
  persist(
    (set) => ({
      cards: examples,
      defaultId: examples[0].id,
      add: (card) => set((state) => ({ cards: [...state.cards, card], defaultId: card.id })),
      remove: (id) =>
        set((state) => {
          const cards = state.cards.filter((c) => c.id !== id);
          return { cards, defaultId: state.defaultId === id ? cards[0]?.id ?? null : state.defaultId };
        }),
      setDefault: (id) => set({ defaultId: id }),
      reset: () => set({ cards: examples, defaultId: examples[0].id }),
    }),
    { name: 'uniride-cards', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// The card used for "pay by card" (or null if you have none).
export const useDefaultCard = () =>
  useCards((s) => s.cards.find((c) => c.id === s.defaultId) ?? s.cards[0] ?? null);