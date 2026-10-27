// src/data/campuses.ts
// Mock data for now. Later this list will come from the backend,
// and only this file will need to change.
export type Campus = {
  id: string;
  name: string;
  location: string;
};

export const campuses: Campus[] = [
  { id: 'ui', name: 'University of Ibadan', location: 'Ibadan, Oyo' },
  { id: 'unilag', name: 'University of Lagos', location: 'Akoka, Lagos' },
  { id: 'oau', name: 'Obafemi Awolowo University', location: 'Ile-Ife, Osun' },
  { id: 'lcu', name: 'Lead City University', location: 'Ibadan, Oyo' },
  { id: 'pcu', name: 'Precious Cornerstone University', location: 'Ibadan, Oyo' },
  { id: 'abuad', name: 'Afe Babalola University (ABUAD)', location: 'Ado-Ekiti, Ekiti' },
  { id: 'uniben', name: 'University of Benin', location: 'Benin City, Edo' },
  { id: 'unilorin', name: 'University of Ilorin', location: 'Ilorin, Kwara' },
];