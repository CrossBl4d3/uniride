// src/store/session.ts
// Things that involve ALL the saved stores at once.
import { useUser } from './useUser';
import { useRides } from './useRides';
import { useWallet } from './useWallet';
import { useSafety } from './useSafety';
import { usePlaces } from './usePlaces';
import { useCards } from './useCards';
import { useBooking } from './useBooking';
import { useTrip } from './useTrip';

type SavedStore = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
};
const savedStores: SavedStore[] = [useUser, useRides, useWallet, useSafety, usePlaces, useCards];

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

export function signOutEverywhere() {
  useTrip.getState().reset();
  useBooking.getState().reset();
  useUser.getState().reset();
  useRides.getState().reset();
  useWallet.getState().reset();
  useSafety.getState().reset();
  usePlaces.getState().reset();
  useCards.getState().reset();
}