// src/utils/format.ts
// Small helpers that turn raw data into display text.

// "8034567821" → "803 456 7821"
export function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}

// 12 → "9:46 PM" if it's 9:34 PM now
export function clockIn(minutes: number) {
  const d = new Date(Date.now() + minutes * 60_000);
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}

// 2450 → "₦2,450"
export function naira(amount: number) {
  // The pattern finds every spot that has a multiple of 3 digits after it, and puts a comma there.
  return '₦' + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}