// src/data/payments.ts — mock payment methods
import { IconName } from '../components/Icon';
import { naira } from '../utils/format';

export type PaymentMethodId = 'wallet' | 'card' | 'bank' | 'cash';

export const WALLET_BALANCE = 20022; // later: fetched from the backend

export const paymentMethods: { id: PaymentMethodId; title: string; subtitle: string; icon: IconName }[] = [
  // The subtitle is built FROM the balance, so the two can never disagree.
  { id: 'wallet', title: 'UniRide Wallet', subtitle: `Balance ${naira(WALLET_BALANCE)}`, icon: 'wallet' },
  { id: 'card', title: 'Debit card', subtitle: 'Visa •••• 4417', icon: 'card' },
  { id: 'bank', title: 'Bank transfer', subtitle: 'Pay from any Nigerian bank', icon: 'bank' },
  { id: 'cash', title: 'Cash', subtitle: 'Pay your driver directly', icon: 'cash' },
];