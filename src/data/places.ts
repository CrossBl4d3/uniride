// src/data/places.ts — mock places until the backend exists
import { IconName } from '../components/Icon';

export type Place = {
  id: string;
  name: string;
  area: string;
  distance?: string;
};

// Where the rider is right now (later: real GPS + reverse geocoding).
export const currentLocation: Place = { id: 'current', name: 'Your location', area: 'UI First Gate' };

export const recentPlaces: Place[] = [
  { id: 'cbn-lt', name: 'CBN Lecture Theatre', area: 'Faculty of Science', distance: '1.2 km' },
  { id: 'law-lt', name: 'Law Lecture Theatre', area: 'Faculty of Law', distance: '1.8 km' },
  { id: 'large-lt', name: 'Large Lecture Theatre', area: 'Faculty of Arts', distance: '2.1 km' },
];

// Saved shortcuts: the label is what you call it, the place is where it really is.
export const savedPlaces: { label: string; icon: IconName; place: Place }[] = [
  { label: 'Hall', icon: 'home', place: { id: 'mellanby', name: 'Kenneth Mellanby Hall', area: 'Hall of residence, UI', distance: '1.5 km' } },
  { label: 'Faculty', icon: 'school', place: { id: 'sci', name: 'Faculty of Science', area: 'University of Ibadan', distance: '1.2 km' } },
];

// Everything the search box can find.
export const searchablePlaces: Place[] = [
  ...recentPlaces, // "..." copies every item from recentPlaces into this list
  ...savedPlaces.map((s) => s.place),
  { id: 'fb-ui', name: 'First Bank, UI Branch', area: 'Oyo Road, Agbowo, Ibadan', distance: '0.8 km' },
  { id: 'fb-atm', name: 'First Bank ATM', area: 'Faculty of Science, UI', distance: '1.6 km' },
  { id: 'fb-bodija', name: 'First Bank, Bodija Branch', area: 'Bodija, Ibadan', distance: '3.4 km' },
  { id: 'kdl', name: 'Kenneth Dike Library', area: 'Central campus, UI', distance: '1.0 km' },
  { id: 'trenchard', name: 'Trenchard Hall', area: 'Central campus, UI', distance: '0.9 km' },
  { id: 'kuti', name: 'Kuti Hall', area: 'Hall of residence, UI', distance: '1.4 km' },
  { id: 'queens', name: 'Queen Elizabeth II Hall', area: 'Hall of residence, UI', distance: '1.1 km' },
  { id: 'tedder', name: 'Tedder Hall', area: 'Hall of residence, UI', distance: '1.7 km' },
  { id: 'tech', name: 'Faculty of Technology', area: 'University of Ibadan', distance: '2.0 km' },
  { id: 'sports', name: 'UI Sports Centre', area: 'University of Ibadan', distance: '1.3 km' },
  { id: 'gate2', name: 'UI Second Gate', area: 'Ajibode Road, Ibadan', distance: '2.6 km' },
];