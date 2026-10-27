// src/utils/route.ts
// Draws a believable route without a maps backend: two straight legs at a
// right angle, like turning one corner on campus roads. A real directions
// API (later, via the backend) returns the exact road path instead.
export type LatLng = { latitude: number; longitude: number };

export function mockRoute(start: LatLng, km: number, seed: string): LatLng[] {
  // Turn the place id into a stable direction, so the same place always
  // appears in the same spot.
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  const angle = (hash * Math.PI) / 180;

  const degrees = (km / 111) * 0.8; // ~111 km per degree; roads are longer than a straight line
  const end = {
    latitude: start.latitude + Math.sin(angle) * degrees,
    longitude: start.longitude + Math.cos(angle) * degrees,
  };
  const corner = { latitude: end.latitude, longitude: start.longitude };
  return [start, corner, end];
}