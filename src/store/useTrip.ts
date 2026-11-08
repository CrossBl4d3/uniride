// src/store/useTrip.ts
// The live trip: a STATE MACHINE (one status at a time) plus a SIMULATOR that moves
// through the statuses with timers. Saved to the phone, and it keeps going on its own,
// so a minimised trip never gets stuck and a restart picks up where it left off.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Driver, driverFor } from '../data/drivers';
import { RideTypeId } from '../data/rides';
import { LatLng } from '../utils/route';
import { useBooking } from './useBooking';
import { useRides, RideRecord } from './useRides';
import { useWallet } from './useWallet';

export type TripStatus =
  | 'idle'
  | 'searching'
  | 'found'
  | 'arriving'
  | 'arrived'
  | 'onTrip'
  | 'complete'
  | 'noDrivers';

// "Live" = a ride is in progress. You can't book another while one is live.
export const isLive = (s: TripStatus) => ['searching', 'found', 'arriving', 'arrived', 'onTrip'].includes(s);

// ---- Simulator settings ----
const SEARCH_SECONDS = 4;
const FOUND_SECONDS = 5; // after accepting, the driver sets off by themselves
const APPROACH_SECONDS = 15;
const PIN_WAIT_SECONDS = 8;
const TRIP_SECONDS = 20;
const TICK_MS = 500;
export const NO_DRIVERS_CHANCE = 0;
export const FREE_CANCEL_SECONDS = 120;
export const CANCEL_FEE = 100;

const WALLET = 'UniRide Wallet';

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
  resume: () => void;
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

const refund = (s: TripDetails, amount: number, why: string) => {
  if (s.paidWith !== WALLET || amount <= 0) return;
  useWallet.getState().add({ kind: 'refund', title: 'Refund', detail: why, amount });
};

const blank = {
  status: 'idle' as TripStatus,
  driver: null as Driver | null,
  approach: [] as LatLng[],
  progress: 0,
  pin: '',
  receipt: '',
  bookedAt: 0,
  arriveAt: 0,
};

export const useTrip = create<TripState>()(
  persist(
    (set, get) => {
      // Move `progress` towards 1. It continues from wherever progress already is,
      // which is what lets a restarted app pick up mid-drive.
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

      // ---- Each stage of the ride, as its own small function ----
      const findDriver = () => {
        timeout = setTimeout(() => {
          if (Math.random() < NO_DRIVERS_CHANCE) {
            set({ status: 'noDrivers' });
            refund(get(), get().total, 'No drivers available');
          } else {
            set({ status: 'found', driver: driverFor(get().rideType) });
            setOffSoon();
          }
        }, SEARCH_SECONDS * 1000);
      };
      const setOffSoon = () => {
        timeout = setTimeout(() => get().track(), FOUND_SECONDS * 1000);
      };
      const driveToPickup = () =>
        runProgress(APPROACH_SECONDS, () => {
          set({ status: 'arrived' });
          timeout = setTimeout(startRide, PIN_WAIT_SECONDS * 1000);
        });
      const startRide = () => {
        set({ status: 'onTrip', progress: 0, arriveAt: Date.now() + get().tripMin * 60_000 });
        driveToDestination();
      };
      const driveToDestination = () =>
        runProgress(TRIP_SECONDS, () => {
          set({ status: 'complete' });
          useRides.getState().add(recordOf(get(), 'completed', get().total));
        });

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
          if (details.paidWith === WALLET) {
            useWallet.getState().add({
              kind: details.rideType,
              title: `${details.rideType === 'keke' ? 'Keke' : 'Cab'} ride`,
              detail: `To ${details.destinationName}`,
              amount: -details.total,
            });
          }
          findDriver();
        },

        // "Track my ride" (or the driver setting off by themselves after FOUND_SECONDS).
        track: () => {
          if (get().status !== 'found') return;
          stopTimers();
          set({ status: 'arriving', progress: 0 });
          driveToPickup();
        },

        // After the app restarts, timers are gone: restart the right one for the saved status.
        resume: () => {
          stopTimers();
          switch (get().status) {
            case 'searching':
              findDriver();
              break;
            case 'found':
              setOffSoon();
              break;
            case 'arriving':
              driveToPickup();
              break;
            case 'arrived':
              timeout = setTimeout(startRide, PIN_WAIT_SECONDS * 1000);
              break;
            case 'onTrip':
              driveToDestination();
              break;
          }
        },

        retry: () => get().start(detailsOf(get())),

        cancel: (fee) => {
          refund(get(), get().total - fee, 'Cancelled ride');
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
    },
    { name: 'uniride-trip', storage: createJSONStorage(() => AsyncStorage) }
  )
);