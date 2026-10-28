// src/data/payments.ts — mock payment methods
import { IconName } from '../components/Icon';

export type PaymentMethodId = 'wallet' | 'card' | 'bank' | 'cash';

export const paymentMethods: { id: PaymentMethodId; title: string; subtitle: string; icon: IconName }[] = [
  // The wallet's subtitle is the LIVE balance, filled in on the Confirm & pay screen.
  { id: 'wallet', title: 'UniRide Wallet', subtitle: '', icon: 'wallet' },
  { id: 'card', title: 'Debit card', subtitle: 'Visa •••• 4417', icon: 'card' },
  { id: 'bank', title: 'Bank transfer', subtitle: 'Pay from any Nigerian bank', icon: 'bank' },
  { id: 'cash', title: 'Cash', subtitle: 'Pay your driver directly', icon: 'cash' },
];