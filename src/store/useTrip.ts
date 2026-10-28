// src/store/useTrip.ts
// The live trip: a STATE MACHINE (one status at a time) plus a SIMULATOR
// that moves through the statuses with timers until a real backend exists.
import { create } from 'zustand';
import { Driver, driverFor } from '../data/drivers';
import { RideTypeId } from '../data/rides';
import { LatLng } from '../utils/route';
import { useBooking } from './useBooking';

export type TripStatus =
  | 'idle'
  | 'searching'  // 15 Finding your driver
  | 'found'      // 16 Driver found
  | 'arriving'   // 17 Driver on the way
  | 'arrived'    // 18 Driver has arrived
  | 'onTrip'     // 19 Trip in progress
  | 'complete'   // 20 Rate driver
  | 'noDrivers'; // 22 No Kekes available

// ---- Simulator settings (change these to test different situations) ----
const SEARCH_SECONDS = 4;
const APPROACH_SECONDS = 15;
const PIN_WAIT_SECONDS = 8;
const TRIP_SECONDS = 20;
const TICK_MS = 500;
export const NO_DRIVERS_CHANCE = 0;     // 1 = always "No Kekes nearby"
export const FREE_CANCEL_SECONDS = 120; // 10 = see the cancellation fee quickly
export const CANCEL_FEE = 100;

let timeout: ReturnType<typeof setTimeout> | null = null;
let interval: ReturnType<typeof setInterval> | null = null;
function stopTimers() {
  if (timeout) clearTimeout(timeout);
  if (interval) clearInterval(interval);
  timeout = null;
  interval = null;
}

export type TripDetails = {
  rideType: RideTypeId;
  route: LatLng[];
  total: number;
  paidWith: string;
  pickupName: string;
  destinationName: string;
  km: number;
  tripMin: number;
  awayMin: number;
};

type TripState = TripDetails & {
  status: TripStatus;
  driver: Driver | null;
  approach: LatLng[];
  progress: number;
  pin: string;
  receipt: string;
  bookedAt: number; // when the ride was booked (for the free-cancel rule)
  arriveAt: number; // fixed arrival time, set once the trip starts
  start: (details: TripDetails) => void;
  track: () => void;
  retry: () => void;
  end: () => void;
  reset: () => void;
};

const emptyDetails: TripDetails = {
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

// Copy just the booking details out of the full state (used by retry).
const detailsOf = (s: TripDetails): TripDetails => ({
  rideType: s.rideType,
  route: s.route,
  total: s.total,
  paidWith: s.paidWith,
  pickupName: s.pickupName,
  destinationName: s.destinationName,
  km: s.km,
  tripMin: s.tripMin,
  awayMin: s.awayMin,
});

export const useTrip = create<TripState>((set, get) => {
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

  const blank = {
    status: 'idle' as TripStatus,
    driver: null,
    approach: [] as LatLng[],
    progress: 0,
    pin: '',
    receipt: '',
    bookedAt: 0,
    arriveAt: 0,
  };

  return {
    ...emptyDetails,
    ...blank,

    start: (details) => {
      stopTimers();
      const pickup = details.route[0];
      const from = { latitude: pickup.latitude - 0.0045, longitude: pickup.longitude + 0.0035 };
      set({
        ...details,
        status: 'searching',
        driver: null,
        approach: [from, { latitude: from.latitude, longitude: pickup.longitude }, pickup],
        progress: 0,
        pin: String(Math.floor(1000 + Math.random() * 9000)),
        receipt: `#UR-${Math.floor(10000 + Math.random() * 90000)}`,
        bookedAt: Date.now(),
        arriveAt: 0,
      });
      timeout = setTimeout(() => {
        if (Math.random() < NO_DRIVERS_CHANCE) {
          set({ status: 'noDrivers' });
        } else {
          set({ status: 'found', driver: driverFor(details.rideType) });
        }
      }, SEARCH_SECONDS * 1000);
    },

    track: () => {
      if (get().status !== 'found') return;
      set({ status: 'arriving', progress: 0 });
      runProgress(APPROACH_SECONDS, () => {
        set({ status: 'arrived' });
        timeout = setTimeout(() => {
          // Work out the arrival time ONCE, when the trip really starts.
          set({ status: 'onTrip', progress: 0, arriveAt: Date.now() + get().tripMin * 60_000 });
          runProgress(TRIP_SECONDS, () => set({ status: 'complete' }));
        }, PIN_WAIT_SECONDS * 1000);
      });
    },

    // Book the same ride again (No Kekes → Try again).
    retry: () => get().start(detailsOf(get())),

    // Finish (cancelled, rated or skipped): stop now, clear up after the screen has closed.
    end: () => {
      stopTimers();
      const thisTrip = get().bookedAt;
      setTimeout(() => {
        if (get().bookedAt !== thisTrip) return; // a new trip started since: leave it alone
        get().reset();
        useBooking.getState().reset(); // one store can update another with getState()
      }, 600);
    },

    reset: () => {
      stopTimers();
      set({ ...emptyDetails, ...blank });
    },
  };
});