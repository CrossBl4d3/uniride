// src/app/payment-methods.tsx — 33 Payment methods
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/Button';
import { Icon, IconName } from '../components/Icon';
import { Radio } from '../components/Radio';
import { useBooking } from '../store/useBooking';
import { useWallet } from '../store/useWallet';
import { useCards, cardLabel, Card } from '../store/useCards';
import { naira } from '../utils/format';
import { colors, space, radius, type } from '../theme';

function MethodRow({ icon, title, subtitle, selected, onPress, onLongPress, divider }: {
  icon: IconName;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  divider?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.row, divider && styles.divider]}
    >
      <View style={styles.icon}>
        <Icon name={icon} size={20} color={colors.icon.accent} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{selected ? `${subtitle} · Default for rides` : subtitle}</Text>
      </View>
      <Radio selected={selected} />
    </Pressable>
  );
}

export default function PaymentMethods() {
  const insets = useSafeAreaInsets();
  const paymentMethod = useBooking((s) => s.paymentMethod);
  const setPaymentMethod = useBooking((s) => s.setPaymentMethod);
  const balance = useWallet((s) => s.balance);
  const { cards, defaultId, setDefault, remove } = useCards();

  const defaultCardId = defaultId ?? cards[0]?.id ?? null;
  // "Pay by card" with no cards left means wallet is what you'd really pay with.
  const chosen = paymentMethod === 'card' && cards.length === 0 ? 'wallet' : paymentMethod;

  const chooseCard = (card: Card) => {
    setDefault(card.id);
    setPaymentMethod('card');
  };

  const confirmRemove = (card: Card) =>
    Alert.alert(`Remove ${cardLabel(card)}?`, 'You can add it again any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(card.id) },
    ]);

  return (
    <View style={styles.screen}>
      <TopBar title="Payment methods" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, chosen === 'wallet' && styles.cardSelected]}>
          <MethodRow
            icon="wallet"
            title="UniRide Wallet"
            subtitle={naira(balance)}
            selected={chosen === 'wallet'}
            onPress={() => setPaymentMethod('wallet')}
          />
        </View>

        <Text style={styles.overline}>Cards</Text>
        {cards.length > 0 ? (
          <View style={styles.card}>
            {cards.map((c, i) => (
              <MethodRow
                key={c.id}
                icon="card"
                title={cardLabel(c)}
                subtitle={`Expires ${c.expiry}`}
                selected={chosen === 'card' && defaultCardId === c.id}
                onPress={() => chooseCard(c)}
                onLongPress={() => confirmRemove(c)}
                divider={i < cards.length - 1}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No cards yet.</Text>
        )}
        {cards.length > 0 && <Text style={styles.hint}>Press and hold a card to remove it.</Text>}

        <Text style={styles.overline}>Other ways to pay</Text>
        <View style={styles.card}>
          <MethodRow
            icon="bank"
            title="Bank transfer"
            subtitle="Get a one-time account number"
            selected={chosen === 'bank'}
            onPress={() => setPaymentMethod('bank')}
            divider
          />
          <MethodRow
            icon="cash"
            title="Cash"
            subtitle="Pay your driver directly"
            selected={chosen === 'cash'}
            onPress={() => setPaymentMethod('cash')}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button
          label="Add a debit card"
          fullWidth
          icon={<Icon name="plus" size={18} color={colors.text.onAccent} />}
          onPress={() => router.push('/add-card')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space['2xl'], gap: space.md },
  card: {
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  cardSelected: { borderWidth: 1.5, borderColor: colors.border.focus, backgroundColor: colors.bg.surfaceRaised },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border.hairline },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bg.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.bodyStrong, color: colors.text.primary },
  subtitle: { ...type.caption, color: colors.text.secondary },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space.md },
  empty: { ...type.body, color: colors.text.tertiary },
  hint: { ...type.caption, color: colors.text.tertiary, marginTop: -space.xs },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md },
});