// src/app/top-up.tsx — 26 Top up wallet
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';
import { Keypad } from '../components/Keypad';
import { Icon, IconName } from '../components/Icon';
import { Radio } from '../components/Radio';
import { useWallet } from '../store/useWallet';
import { useDefaultCard, cardLabel } from '../store/useCards';
import { naira } from '../utils/format';
import { colors, space, radius, type } from '../theme';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];
const MIN = 100;
const MAX = 100_000;

type Method = 'card' | 'bank';

export default function TopUp() {
  const insets = useSafeAreaInsets();
  const balance = useWallet((s) => s.balance);
  const addToWallet = useWallet((s) => s.add);
  const card = useDefaultCard();
  const [amount, setAmount] = useState(2000);
  const [method, setMethod] = useState<Method>(card ? 'card' : 'bank');
  const [busy, setBusy] = useState(false);

  const methods: { id: Method; title: string; subtitle: string; icon: IconName }[] = [
    { id: 'card', title: 'Debit card', subtitle: card ? cardLabel(card) : 'Add a card to use this', icon: 'card' },
    { id: 'bank', title: 'Bank transfer', subtitle: 'Get a one-time account number', icon: 'bank' },
  ];

  const pick = (m: Method) => {
    if (m === 'card' && !card) {
      router.push('/add-card'); // no card yet: go and add one
      return;
    }
    setMethod(m);
  };

  const addDigit = (d: string) =>
    setAmount((prev) => {
      const next = prev * 10 + Number(d);
      return next > MAX ? prev : next;
    });
  const removeDigit = () => setAmount((prev) => Math.floor(prev / 10));

  const valid = amount >= MIN;

  const finish = (detail: string) => {
    addToWallet({ kind: 'topup', title: 'Wallet top-up', detail, amount });
    router.back();
  };

  const topUp = () => {
    if (method === 'bank' || !card) {
      Alert.alert(
        'Transfer to this account',
        `Send ${naira(amount)} to:\n\n9912 345 678\nWema Bank · UniRide Wallet\n\nThis account number only works for this top-up.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'I’ve sent it', onPress: () => finish('Bank transfer') },
        ]
      );
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      finish(cardLabel(card));
    }, 1500);
  };

  return (
    <View style={styles.screen}>
      <TopBar title="Top up wallet" />

      <View style={styles.content}>
        <Text style={[styles.amount, !valid && { color: colors.text.tertiary }]}>{naira(amount)}</Text>
        <Text style={[styles.hint, !valid && amount > 0 && { color: colors.status.error }]}>
          {valid ? `New balance: ${naira(balance + amount)}` : `Minimum top-up is ${naira(MIN)}`}
        </Text>

        <View style={styles.quick}>
          {QUICK_AMOUNTS.map((q) => {
            const on = q === amount;
            return (
              <Pressable key={q} onPress={() => setAmount(q)} style={[styles.quickItem, on && styles.quickOn]}>
                <Text style={[styles.quickText, on && styles.quickTextOn]}>{naira(q)}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.overline}>Pay with</Text>
        <View style={{ gap: space.sm }}>
          {methods.map((m) => {
            const selected = m.id === method && (m.id !== 'card' || !!card);
            return (
              <Pressable
                key={m.id}
                onPress={() => pick(m.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.method, selected && styles.methodSelected]}
              >
                <View style={styles.methodIcon}>
                  <Icon name={m.icon} size={20} color={colors.icon.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>{m.title}</Text>
                  <Text style={styles.methodSub}>{m.subtitle}</Text>
                </View>
                <Radio selected={selected} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button label={`Top up ${naira(amount)}`} fullWidth disabled={!valid} loading={busy} onPress={topUp} />
        <Keypad onDigit={addDigit} onDelete={removeDigit} onClear={() => setAmount(0)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.sm },
  amount: { ...type.display, color: colors.text.primary },
  hint: { ...type.caption, color: colors.text.secondary },
  quick: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  quickItem: {
    flex: 1,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickOn: { backgroundColor: colors.bg.accent, borderColor: colors.bg.accent },
  quickText: { ...type.captionStrong, color: colors.text.secondary },
  quickTextOn: { color: colors.text.onAccent },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space.lg },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  methodSelected: { borderWidth: 1.5, borderColor: colors.border.focus, backgroundColor: colors.bg.surfaceRaised },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bg.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: { ...type.bodyStrong, color: colors.text.primary },
  methodSub: { ...type.caption, color: colors.text.secondary },
  bottom: { marginTop: 'auto', paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.lg },
});