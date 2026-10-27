// src/utils/fare.ts
// Mock pricing until the backend calculates real fares.
import { RideTypeId } from '../data/rides';

// "1.2 km" → 1.2  (falls back to 1 km if missing)
export function parseKm(distance?: string) {
  const n = parseFloat(distance ?? '');
  return Number.isNaN(n) ? 1 : n;
}

const roundTo50 = (n: number) => Math.round(n / 50) * 50;

// Keke: ₦200 + ₦100 per km, minimum ₦300. Cab: ~1.6× Keke, minimum ₦500.
export function fareFor(ride: RideTypeId, km: number) {
  const keke = Math.max(300, roundTo50(200 + km * 100));
  return ride === 'keke' ? keke : Math.max(500, roundTo50(keke * 1.6));
}

// Roughly 4 minutes per km on campus roads, at least 3.
export function tripMinutes(km: number) {
  return Math.max(3, Math.round(km * 4));
}