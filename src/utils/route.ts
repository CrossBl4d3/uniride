// src/utils/route.ts
// Mock routes until a real directions API (via the backend) gives exact road paths.
export type LatLng = { latitude: number; longitude: number };

// Straight-line distance between two points on Earth, in km ("haversine" formula).
export function distanceKm(a: LatLng, b: LatLng) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Two straight legs at a right angle, like turning one corner on campus roads.
// If `end` is given (a dropped pin), the route goes exactly there.
// Otherwise we invent a stable spot from the place id.
export function mockRoute(start: LatLng, km: number, seed: string, end?: LatLng): LatLng[] {
  let target = end;
  if (!target) {
    let hash = 0;
    for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
    const angle = (hash * Math.PI) / 180;
    const degrees = (km / 111) * 0.8;
    target = {
      latitude: start.latitude + Math.sin(angle) * degrees,
      longitude: start.longitude + Math.cos(angle) * degrees,
    };
  }
  const corner = { latitude: target.latitude, longitude: start.longitude };
  return [start, corner, target];
}