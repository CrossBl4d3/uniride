// src/utils/route.ts
// Mock routes until a real directions API (via the backend) gives exact road paths.
export type LatLng = { latitude: number; longitude: number };

// Straight-line distance between two points on Earth, in km ("haversine" formula).
export function distanceKm(a: LatLng, b: LatLng) {
  const R = 6371;
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

// The route for a booked destination (uses the pin's exact spot if it has one).
export function routeTo(
  start: LatLng,
  km: number,
  destination: { id: string; latitude?: number; longitude?: number }
) {
  const pinned =
    destination.latitude != null && destination.longitude != null
      ? { latitude: destination.latitude, longitude: destination.longitude }
      : undefined;
  return mockRoute(start, km, destination.id, pinned);
}

// The point that is `t` of the way along a path (t = 0 → start, 0.5 → halfway, 1 → end).
// This is how the Keke "drives" along the route.
export function pointAlong(path: LatLng[], t: number): LatLng {
  if (path.length === 0) return { latitude: 0, longitude: 0 };
  if (t <= 0 || path.length === 1) return path[0];
  if (t >= 1) return path[path.length - 1];

  const legs = path.slice(1).map((p, i) => distanceKm(path[i], p)); // length of each straight piece
  const total = legs.reduce((sum, leg) => sum + leg, 0);
  let remaining = t * total;

  for (let i = 0; i < legs.length; i++) {
    if (remaining <= legs[i]) {
      const f = legs[i] === 0 ? 0 : remaining / legs[i]; // how far along THIS piece
      const a = path[i];
      const b = path[i + 1];
      return {
        latitude: a.latitude + (b.latitude - a.latitude) * f,
        longitude: a.longitude + (b.longitude - a.longitude) * f,
      };
    }
    remaining -= legs[i];
  }
  return path[path.length - 1];
}