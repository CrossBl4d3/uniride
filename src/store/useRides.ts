// src/store/useRides.ts
// Your ride history. Finished and cancelled trips are added here.
// It starts with a few example rides so the screen isn't empty.
import { create } from 'zustand';
import { Driver, driverFor } from '../data/drivers';
import { RideTypeId } from '../data/rides';
import { campuses } from '../data/campuses';
import { LatLng, mockRoute } from '../utils/route';

export type RideRecord = {
  id: string; // the receipt number, e.g. "UR-20931"
  status: 'completed' | 'cancelled';
  rideType: RideTypeId;
  pickupName: string;
  destinationName: string;
  startedAt: number; // ms
  endedAt: number;
  km: number;
  minutes: number;
  fare: number;
  fee: number;
  discount: number;
  total: number;   // what the ride cost
  charged: number; // what was actually taken (₦0 or a fee if cancelled)
  paidWith: string;
  driver: Driver | null;
  route: LatLng[];
};

// A time `days` ago at hour:minute, so the examples always look recent.
const at = (days: number, hour: number, minute: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
};

const ui = campuses[0];
const start = { latitude: ui.latitude, longitude: ui.longitude };

const examples: RideRecord[] = [
  {
    id: 'UR-18842', status: 'completed', rideType: 'cab',
    pickupName: 'Faculty of Science', destinationName: 'Bodija Market',
    startedAt: at(1, 14, 10), endedAt: at(1, 14, 26), km: 3.6, minutes: 16,
    fare: 800, fee: 20, discount: 20, total: 800, charged: 800,
    paidWith: 'UniRide Wallet', driver: driverFor('cab'), route: mockRoute(start, 3.6, 'bodija'),
  },
  {
    id: 'UR-17310', status: 'cancelled', rideType: 'keke',
    pickupName: 'Kenneth Mellanby Hall', destinationName: 'CBN Lecture Theatre',
    startedAt: at(16, 8, 5), endedAt: at(16, 8, 6), km: 1.2, minutes: 5,
    fare: 300, fee: 20, discount: 20, total: 300, charged: 0,
    paidWith: 'UniRide Wallet', driver: driverFor('keke'), route: mockRoute(start, 1.2, 'cbn-lt'),
  },
  {
    id: 'UR-16954', status: 'completed', rideType: 'keke',
    pickupName: 'Trenchard Hall', destinationName: 'Kenneth Mellanby Hall',
    startedAt: at(19, 18, 30), endedAt: at(19, 18, 36), km: 1.5, minutes: 6,
    fare: 300, fee: 20, discount: 20, total: 300, charged: 300,
    paidWith: 'UniRide Wallet', driver: driverFor('keke'), route: mockRoute(start, 1.5, 'mellanby'),
  },
];

type RidesState = {
  rides: RideRecord[]; // newest first
  add: (ride: RideRecord) => void;
};

export const useRides = create<RidesState>((set) => ({
  rides: examples,
  // set() can take a function: it receives the CURRENT state and returns the change.
  // Use this whenever the new value depends on the old one.
  add: (ride) => set((state) => ({ rides: [ride, ...state.rides] })),
}));