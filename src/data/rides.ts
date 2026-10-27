// src/data/rides.ts — the vehicle options (mock)
export type RideTypeId = 'keke' | 'cab';

export type RideType = {
  id: RideTypeId;
  name: string;
  seats: number;
  awayMin: number; // how far the nearest driver is, in minutes
  image: number;   // require() gives back a number that React Native uses to find the image
};

export const rideTypes: RideType[] = [
  { id: 'keke', name: 'Keke', seats: 3, awayMin: 3, image: require('../../assets/images/keke.png') },
  { id: 'cab', name: 'Cab', seats: 4, awayMin: 6, image: require('../../assets/images/cab.png') },
];