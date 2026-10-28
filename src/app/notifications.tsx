// src/app/notifications.tsx — 31 Notifications
// Built from your REAL activity: ride history + wallet. Nothing is stored twice.
import { View, Text, SectionList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { TopBar } from '../components/TopBar';
import { Icon, IconName } from '../components/Icon';
import { useRides } from '../store/useRides';
import { useWallet } from '../store/useWallet';
import { clockAt, dayLabel, naira } from '../utils/format';
import { colors, space, radius, type } from '../theme';

type Note = {
  id: string;
  icon: IconName;
  title: string;
  detail: string;
  at: number;
  open?: () => void;
};

export default function Notifications() {
  const rides = useRides((s) => s.rides);
  const activity = useWallet((s) => s.activity);

  const notes: Note[] = [
    ...rides.map((r): Note =>
      r.status === 'completed'
        ? {
            id: `ride-${r.id}`,
            icon: 'rides',
            title: 'Your trip receipt',
            detail: `${naira(r.total)} · ${r.pickupName} → ${r.destinationName}`,
            at: r.endedAt,
            open: () => router.push({ pathname: '/rides/[id]', params: { id: r.id } }),
          }
        : {
            id: `ride-${r.id}`,
            icon: 'close',
            title: 'Ride cancelled',
            detail: r.charged > 0 ? `${naira(r.charged)} cancellation fee` : `No charge · ${r.destinationName}`,
            at: r.endedAt,
            open: () => router.push({ pathname: '/rides/[id]', params: { id: r.id } }),
          }
    ),
    ...activity
      .filter((e) => e.kind === 'topup' || e.kind === 'refund')
      .map(
        (e): Note => ({
          id: `wallet-${e.id}`,
          icon: e.kind === 'topup' ? 'wallet' : 'arrow-left',
          title: e.kind === 'topup' ? 'Wallet topped up' : 'Refund processed',
          detail: e.kind === 'topup' ? `${naira(e.amount)} added from ${e.detail}` : `${naira(e.amount)} returned · ${e.detail}`,
          at: e.at,
          open: () => router.navigate('/wallet' as never),
        })
      ),
  ].sort((a, b) => b.at - a.at); // newest first

  // SectionList wants groups: [{ title, data: [...] }, ...]
  const today = notes.filter((n) => dayLabel(n.at) === 'Today');
  const earlier = notes.filter((n) => dayLabel(n.at) !== 'Today');
  const sections = [
    ...(today.length ? [{ title: 'Today', data: today }] : []),
    ...(earlier.length ? [{ title: 'Earlier', data: earlier }] : []),
  ];

  return (
    <View style={styles.screen}>
      <TopBar title="Notifications" />

      <SectionList
        sections={sections}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <Text style={styles.overline}>{section.title}</Text>}
        renderItem={({ item, index, section }) => {
          const first = index === 0;
          const last = index === section.data.length - 1;
          const when = dayLabel(item.at) === 'Today' ? clockAt(item.at) : dayLabel(item.at).split(' ')[0];
          return (
            // Round the top of the first row and the bottom of the last: together they look like one card.
            <Pressable
              onPress={item.open}
              style={({ pressed }) => [
                styles.row,
                first && styles.firstRow,
                last && styles.lastRow,
                !last && styles.divider,
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={styles.icon}>
                <Icon name={item.icon} size={20} color={colors.icon.accent} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.detail} numberOfLines={1}>{item.detail}</Text>
              </View>
              <Text style={styles.when}>{when}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="bell" size={40} color={colors.icon.muted} />
            <Text style={styles.emptyText}>You’re all caught up.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  list: { paddingHorizontal: space.xl, paddingBottom: space['3xl'] },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space.lg, marginBottom: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    backgroundColor: colors.bg.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border.hairline,
  },
  firstRow: { borderTopWidth: 1, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  lastRow: { borderBottomWidth: 1, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
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
  detail: { ...type.caption, color: colors.text.secondary },
  when: { ...type.caption, color: colors.text.tertiary },
  empty: { alignItems: 'center', gap: space.md, paddingVertical: space['5xl'] },
  emptyText: { ...type.body, color: colors.text.tertiary },
});