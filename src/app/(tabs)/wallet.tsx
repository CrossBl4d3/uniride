// src/app/(tabs)/wallet.tsx — 25 Wallet
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../components/Icon';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { useTabBarHeight } from '../../components/TabBar';
import { useWallet, WalletEntry } from '../../store/useWallet';
import { useUser } from '../../store/useUser';
import { fareFor, priceBreakdown } from '../../utils/fare';
import { dayLabel, naira } from '../../utils/format';
import { colors, space, radius, type } from '../../theme';

const icons: Record<WalletEntry['kind'], IconName> = {
  keke: 'keke',
  cab: 'car',
  topup: 'plus',
  refund: 'arrow-left',
};

export default function Wallet() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const balance = useWallet((s) => s.balance);
  const activity = useWallet((s) => s.activity);
  const email = useUser((s) => s.email);

  // "≈ 8 Keke rides": how many of the cheapest Keke trips the balance covers.
  const isStudent = email.toLowerCase().endsWith('.edu.ng');
  const shortestKeke = priceBreakdown(fareFor('keke', 1), isStudent).total;
  const ridesWorth = Math.floor(balance / shortestKeke);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg, paddingBottom: tabBarHeight + space.xl }]}
    >
      <Text style={styles.heading}>Wallet</Text>

      <View style={styles.balanceCard}>
        <View style={styles.balanceTop}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          {isStudent && <Chip variant="accent" icon="school" label="Student" />}
        </View>
        <Text style={styles.balance}>{naira(balance)}.00</Text>
        <Text style={styles.balanceLabel}>
          {ridesWorth > 0
            ? `≈ ${ridesWorth} Keke ride${ridesWorth === 1 ? '' : 's'} at ${isStudent ? 'student' : 'standard'} fare`
            : 'Top up to pay for rides from your wallet'}
        </Text>
        <View style={styles.balanceActions}>
          <Button
            label="Top up"
            size="small"
            icon={<Icon name="plus" size={16} color={colors.text.onAccent} />}
            onPress={() => router.push('/top-up')}
            style={styles.half}
          />
          <Button
            label="Cards & banks"
            size="small"
            variant="secondary"
            icon={<Icon name="card" size={16} />}
            onPress={() => Alert.alert('Cards & banks', 'Managing cards comes in Stage 7.')}
            style={styles.half}
          />
        </View>
      </View>

      <Text style={styles.overline}>Recent activity</Text>
      <View style={styles.activity}>
        {activity.map((e, i) => (
          <View key={e.id} style={[styles.row, i < activity.length - 1 && styles.divider]}>
            <View style={styles.rowIcon}>
              <Icon name={icons[e.kind]} size={20} color={colors.icon.accent} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.rowTitle}>{e.title}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {e.detail} · {dayLabel(e.at)}
              </Text>
            </View>
            <Text style={[styles.amount, e.amount > 0 && { color: colors.text.accent }]}>
              {e.amount > 0 ? '+' : '−'}
              {naira(Math.abs(e.amount))}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, gap: space.lg },
  heading: { ...type.h1, color: colors.text.primary },
  balanceCard: {
    gap: space.sm,
    padding: space['2xl'],
    borderRadius: radius.xl,
    backgroundColor: colors.bg.brand,
  },
  balanceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLabel: { ...type.body, color: colors.text.secondary },
  balance: { ...type.display, color: colors.text.primary },
  balanceActions: { flexDirection: 'row', gap: space.md, marginTop: space.md },
  half: { flex: 1 },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space.sm },
  activity: {
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border.hairline },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bg.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { ...type.bodyStrong, color: colors.text.primary },
  rowMeta: { ...type.caption, color: colors.text.secondary },
  amount: { ...type.bodyStrong, color: colors.text.primary },
});