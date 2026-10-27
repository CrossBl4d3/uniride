// src/data/campuses.ts
// Coordinates are approximate campus centres, good enough to frame the map.
export type Campus = {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
};

export const campuses: Campus[] = [
  { id: 'ui', name: 'University of Ibadan', location: 'Ibadan, Oyo', latitude: 7.4443, longitude: 3.8997 },
  { id: 'unilag', name: 'University of Lagos', location: 'Akoka, Lagos', latitude: 6.5158, longitude: 3.3896 },
  { id: 'oau', name: 'Obafemi Awolowo University', location: 'Ile-Ife, Osun', latitude: 7.5199, longitude: 4.5225 },
  { id: 'lcu', name: 'Lead City University', location: 'Ibadan, Oyo', latitude: 7.3586, longitude: 3.8667 },
  { id: 'pcu', name: 'Precious Cornerstone University', location: 'Ibadan, Oyo', latitude: 7.432, longitude: 3.867 },
  { id: 'abuad', name: 'Afe Babalola University (ABUAD)', location: 'Ado-Ekiti, Ekiti', latitude: 7.6067, longitude: 5.3048 },
  { id: 'uniben', name: 'University of Benin', location: 'Benin City, Edo', latitude: 6.4006, longitude: 5.6224 },
  { id: 'unilorin', name: 'University of Ilorin', location: 'Ilorin, Kwara', latitude: 8.4799, longitude: 4.675 },
];