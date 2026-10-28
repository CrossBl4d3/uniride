// src/utils/geocode.ts
// Turn a point on the map into a Place with a readable name.
// Used by the pin screen AND Add a place, so it lives in one shared file.
import * as Location from 'expo-location';
import { Place } from '../data/places';
import { distanceKm, LatLng } from './route';

export async function placeAt(point: LatLng, from: LatLng, fallbackName = 'Dropped pin'): Promise<Place> {
  const roadKm = distanceKm(from, point) * 1.3; // roads are longer than a straight line
  let name = fallbackName;
  let area = `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;

  try {
    const { granted } = await Location.getForegroundPermissionsAsync();
    if (granted) {
      const [address] = await Location.reverseGeocodeAsync(point);
      if (address) {
        name = address.name || address.street || name;
        area =
          [address.street !== name ? address.street : null, address.district, address.city]
            .filter(Boolean)
            .join(', ') || area;
      }
    }
  } catch {
    // No connection or no permission: keep the fallback name and coordinates.
  }

  return {
    id: `pin-${point.latitude.toFixed(5)}-${point.longitude.toFixed(5)}`,
    name,
    area,
    distance: `${roadKm.toFixed(1)} km`,
    latitude: point.latitude,
    longitude: point.longitude,
  };
}