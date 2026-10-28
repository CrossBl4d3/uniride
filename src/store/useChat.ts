// src/store/useChat.ts
// Messages with your driver, kept per trip (a new trip = a fresh conversation).
import { create } from 'zustand';

export type ChatMessage = {
  id: string;
  from: 'me' | 'driver';
  text: string;
  at: number;
};

type ChatState = {
  tripId: string;
  messages: ChatMessage[];
  typing: boolean; // "Tunde is typing…"
  open: (tripId: string, greeting: string) => void;
  send: (text: string, reply: string) => void;
};

const message = (from: ChatMessage['from'], text: string): ChatMessage => ({
  id: `${Date.now()}-${Math.random()}`,
  from,
  text,
  at: Date.now(),
});

export const useChat = create<ChatState>((set, get) => ({
  tripId: '',
  messages: [],
  typing: false,

  // Opening the chat for a NEW trip starts a new conversation with the driver's greeting.
  open: (tripId, greeting) => {
    if (get().tripId === tripId) return; // same trip: keep the conversation
    set({ tripId, messages: [message('driver', greeting)], typing: false });
  },

  // Your message appears instantly; the (pretend) driver reads, types, then replies.
  send: (text, reply) => {
    const forTrip = get().tripId;
    set((state) => ({ messages: [...state.messages, message('me', text)] }));

    setTimeout(() => {
      if (get().tripId === forTrip) set({ typing: true });
    }, 800);
    setTimeout(() => {
      if (get().tripId !== forTrip) return; // a different trip started: drop the old reply
      set((state) => ({ typing: false, messages: [...state.messages, message('driver', reply)] }));
    }, 2400);
  },
}));