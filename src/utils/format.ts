// src/utils/format.ts
// Small helpers that turn raw data into display text.

// "8034567821" → "803 456 7821"
export function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}

// 12 → "9:46 PM" if it's 9:34 PM now
export function clockIn(minutes: number) {
  const d = new Date(Date.now() + minutes * 60_000);
  const h = d.getHours() % 12 || 12; // 0 and 12 both show as 12
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}