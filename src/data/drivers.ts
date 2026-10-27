// src/data/drivers.ts — mock drivers until real ones come from the backend
import { RideTypeId } from './rides';

export type Driver = {
  name: string;
  firstName: string;
  initials: string;
  rating: number;
  phone: string;
  plate: string;
  vehicle: string; // "Keke" / "Cab"
  color: string;   // shown under the plate
};

const drivers: Record<RideTypeId, Driver> = {
  keke: {
    name: 'Tunde A.',
    firstName: 'Tunde',
    initials: 'TA',
    rating: 4.9,
    phone: '+2340000000000', // placeholder number
    plate: 'OY 214 KJA',
    vehicle: 'Keke',
    color: 'Green Keke',
  },
  cab: {
    name: 'Bisi O.',
    firstName: 'Bisi',
    initials: 'BO',
    rating: 4.8,
    phone: '+2340000000000',
    plate: 'OY 552 IBD',
    vehicle: 'Cab',
    color: 'Silver Corolla',
  },
};

export const driverFor = (ride: RideTypeId) => drivers[ride];