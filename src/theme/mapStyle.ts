// src/theme/mapStyle.ts
// Google Maps (Android) style matching UniRide's dark greens.
// On iPhone, Apple Maps ignores this and uses its own dark mode instead.
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#06302B' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#AACBC4' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#021B1A' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#0B453A' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#095544' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#17876D' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#021B1A' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];