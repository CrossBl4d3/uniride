// src/utils/format.ts
// Small helpers that turn raw data into display text.

// "8034567821" → "803 456 7821"
export function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}

// A moment in time (milliseconds) → "9:46 PM"
export function clockAt(ms: number) {
  const d = new Date(ms);
  const h = d.getHours() % 12 || 12; // 0 and 12 both show as 12
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}

// 12 → the time 12 minutes from now, e.g. "9:46 PM"
export function clockIn(minutes: number) {
  return clockAt(Date.now() + minutes * 60_000);
}

// 2450 → "₦2,450"
export function naira(amount: number) {
  return '₦' + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}