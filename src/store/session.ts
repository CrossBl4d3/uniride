// src/store/session.ts
// Things that involve ALL the saved stores at once.
import { useUser } from './useUser';
import { useRides } from './useRides';
import { useWallet } from './useWallet';
import { useSafety } from './useSafety';
import { useBooking } from './useBooking';
import { useTrip } from './useTrip';

// Anything with a `persist` helper (all our saved stores have one).
type SavedStore = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
};
const savedStores: SavedStore[] = [useUser, useRides, useWallet, useSafety];

// Loading from the phone takes a moment. This resolves once EVERY saved store is ready.
// ("Hydration" = filling a store back up with its saved data.)
export function waitForSavedData() {
  return Promise.all(
    savedStores.map((store) =>
      store.persist.hasHydrated()
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            const stop = store.persist.onFinishHydration(() => {
              stop();
              resolve();
            });
          })
    )
  );
}

// Log out: put every store back to how a brand-new install starts.
export function signOutEverywhere() {
  useTrip.getState().reset();
  useBooking.getState().reset();
  useUser.getState().reset();
  useRides.getState().reset();
  useWallet.getState().reset();
  useSafety.getState().reset();
}