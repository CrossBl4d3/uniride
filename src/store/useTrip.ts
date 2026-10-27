// src/store/useTrip.ts
// The live trip: a STATE MACHINE (one status at a time) plus a SIMULATOR
// that moves through the statuses with timers until a real backend exists.
import { create } from 'zustand';
import { Driver, driverFor } from '../data/drivers';
import { RideTypeId } from '../data/rides';
import { LatLng } from '../utils/route';

export type TripStatus =
  | 'idle'
  | 'searching'  // 15 Finding your driver
  | 'found'      // 16 Driver found
  | 'arriving'   // 17 Driver on the way
  | 'arrived'    // 18 Driver has arrived
  | 'onTrip'     // 19 Trip in progress
  | 'complete'   // 20 Rate driver
  | 'noDrivers'; // 22 No Kekes available

// Simulator timings (seconds). Make them shorter while testing if you like.
const SEARCH_SECONDS = 4;
const APPROACH_SECONDS = 15;
const PIN_WAIT_SECONDS = 8; // pretend the driver typed your PIN
const TRIP_SECONDS = 20;
const TICK_MS = 500;        // how often the Keke moves
export const NO_DRIVERS_CHANCE = 0; // set to 1 to always get "No Kekes nearby"

// Timers live outside the store so we can always stop them.
let timeout: ReturnType<typeof setTimeout> | null = null;
let interval: ReturnType<typeof setInterval> | null = null;
function stopTimers() {
  if (timeout) clearTimeout(timeout);
  if (interval) clearInterval(interval);
  timeout = null;
  interval = null;
}

// What Confirm & pay hands over when the trip starts.
type TripDetails = {
  rideType: RideTypeId;
  route: LatLng[]; // pickup → destination
  total: number;
  paidWith: string; // "UniRide Wallet", "Cash"...
  pickupName: string;
  destinationName: string;
  km: number;
  tripMin: number;
  awayMin: number;
};

type TripState = TripDetails & {
  status: TripStatus;
  driver: Driver | null;
  approach: LatLng[]; // driver → pickup
  progress: number;   // 0..1 along the current path
  pin: string;
  receipt: string;
  start: (details: TripDetails) => void;
  track: () => void;
  reset: () => void;
};

const empty: TripDetails = {
  rideType: 'keke',
  route: [],
  total: 0,
  paidWith: '',
  pickupName: '',
  destinationName: '',
  km: 0,
  tripMin: 0,
  awayMin: 0,
};

export const useTrip = create<TripState>((set, get) => {
  // Move `progress` from 0 to 1 over `seconds`, then call onDone.
  const runProgress = (seconds: number, onDone: () => void) => {
    stopTimers();
    const step = TICK_MS / (seconds * 1000);
    interval = setInterval(() => {
      const next = Math.min(1, get().progress + step);
      set({ progress: next });
      if (next >= 1) {
        stopTimers();
        onDone();
      }
    }, TICK_MS);
  };

  return {
    ...empty,
    status: 'idle',
    driver: null,
    approach: [],
    progress: 0,
    pin: '',
    receipt: '',

    // searching → (after a few seconds) found or noDrivers
    start: (details) => {
      stopTimers();
      const pickup = details.route[0];
      // The driver starts ~600 m away and turns one corner to reach you.
      const from = { latitude: pickup.latitude - 0.0045, longitude: pickup.longitude + 0.0035 };
      set({
        ...details,
        status: 'searching',
        driver: null,
        approach: [from, { latitude: from.latitude, longitude: pickup.longitude }, pickup],
        progress: 0,
        pin: String(Math.floor(1000 + Math.random() * 9000)),
        receipt: `#UR-${Math.floor(10000 + Math.random() * 90000)}`,
      });
      timeout = setTimeout(() => {
        if (Math.random() < NO_DRIVERS_CHANCE) {
          set({ status: 'noDrivers' });
        } else {
          set({ status: 'found', driver: driverFor(details.rideType) });
        }
      }, SEARCH_SECONDS * 1000);
    },

    // found → arriving → arrived → onTrip → complete
    track: () => {
      if (get().status !== 'found') return;
      set({ status: 'arriving', progress: 0 });
      runProgress(APPROACH_SECONDS, () => {
        set({ status: 'arrived' });
        timeout = setTimeout(() => {
          set({ status: 'onTrip', progress: 0 });
          runProgress(TRIP_SECONDS, () => set({ status: 'complete' }));
        }, PIN_WAIT_SECONDS * 1000);
      });
    },

    // Back to nothing (after cancelling, rating, etc.)
    reset: () => {
      stopTimers();
      set({ ...empty, status: 'idle', driver: null, approach: [], progress: 0, pin: '', receipt: '' });
    },
  };
});