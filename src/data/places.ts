// src/data/places.ts — mock places until the backend exists
export type Place = {
  id: string;
  name: string;
  area: string;
  distance?: string;
};

export const recentPlaces: Place[] = [
  { id: 'cbn-lt', name: 'CBN Lecture Theatre', area: 'Faculty of Science', distance: '1.2 km' },
  { id: 'law-lt', name: 'Law Lecture Theatre', area: 'Faculty of Law', distance: '1.8 km' },
  { id: 'large-lt', name: 'Large Lecture Theatre', area: 'Faculty of Arts', distance: '2.1 km' },
];

export const savedPlaces = {
  hall: { id: 'hall', name: 'Kenneth Mellanby Hall', area: 'Hall' },
  faculty: { id: 'faculty', name: 'Faculty of Science', area: 'Faculty' },
};