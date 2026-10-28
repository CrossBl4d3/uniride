// src/store/useTrip.ts
// The live trip: a STATE MACHINE (one status at a time) plus a SIMULATOR
// that moves through the statuses with timers until a real backend exists.
import { create } from 'zustand';
import { Driver, driverFor } from '../data/drivers';
import { RideTypeId } from '../data/rides';
import { LatLng } from '../utils/route';
import { useBooking } from './useBooking';
import { useRides, RideRecord } from './useRides';

export type TripStatus =
  | 'idle'
  | 'searching'
  | 'found'
  | 'arriving'
  | 'arrived'
  | 'onTrip'
  | 'complete'
  | 'noDrivers';

// ---- Simulator settings ----
const SEARCH_SECONDS = 4;
const APPROACH_SECONDS = 15;
const PIN_WAIT_SECONDS = 8;
const TRIP_SECONDS = 20;
const TICK_MS = 500;
export const NO_DRIVERS_CHANCE = 0;
export const FREE_CANCEL_SECONDS = 120;
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
  fare: number;
  fee: number;
  discount: number;
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
  bookedAt: number;
  arriveAt: number;
  start: (details: TripDetails) => void;
  track: () => void;
  retry: () => void;
  cancel: (fee: number) => void;
  end: () => void;
  reset: () => void;
};

const emptyDetails: TripDetails = {
  rideType: 'keke',
  route: [],
  fare: 0,
  fee: 0,
  discount: 0,
  total: 0,
  paidWith: '',
  pickupName: '',
  destinationName: '',
  km: 0,
  tripMin: 0,
  awayMin: 0,
};

const detailsOf = (s: TripDetails): TripDetails => ({
  rideType: s.rideType,
  route: s.route,
  fare: s.fare,
  fee: s.fee,
  discount: s.discount,
  total: s.total,
  paidWith: s.paidWith,
  pickupName: s.pickupName,
  destinationName: s.destinationName,
  km: s.km,
  tripMin: s.tripMin,
  awayMin: s.awayMin,
});

// Turn the live trip into a history entry.
const recordOf = (s: TripState, status: RideRecord['status'], charged: number): RideRecord => ({
  id: s.receipt.replace('#', ''),
  status,
  rideType: s.rideType,
  pickupName: s.pickupName,
  destinationName: s.destinationName,
  startedAt: s.bookedAt,
  endedAt: status === 'completed' && s.arriveAt ? s.arriveAt : Date.now(),
  km: s.km,
  minutes: s.tripMin,
  fare: s.fare,
  fee: s.fee,
  discount: s.discount,
  total: s.total,
  charged,
  paidWith: s.paidWith,
  driver: s.driver,
  route: s.route,
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
          set({ status: 'onTrip', progress: 0, arriveAt: Date.now() + get().tripMin * 60_000 });
          runProgress(TRIP_SECONDS, () => {
            set({ status: 'complete' });
            // One store updating another: save the finished trip to your history.
            useRides.getState().add(recordOf(get(), 'completed', get().total));
          });
        }, PIN_WAIT_SECONDS * 1000);
      });
    },

    retry: () => get().start(detailsOf(get())),

    // Cancel: save it to history (with any fee charged), then finish up.
    cancel: (fee) => {
      useRides.getState().add(recordOf(get(), 'cancelled', fee));
      get().end();
    },

    end: () => {
      stopTimers();
      const thisTrip = get().bookedAt;
      setTimeout(() => {
        if (get().bookedAt !== thisTrip) return;
        get().reset();
        useBooking.getState().reset();
      }, 600);
    },

    reset: () => {
      stopTimers();
      set({ ...emptyDetails, ...blank });
    },
  };
});