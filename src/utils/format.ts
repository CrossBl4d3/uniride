// src/utils/format.ts
// Small helpers that turn raw data into display text.

// "8034567821" → "803 456 7821"
export function formatPhone(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}