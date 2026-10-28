// src/app/(tabs)/rides.tsx — 23 Rides history
import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Chip } from '../../components/Chip';
import { Segmented } from '../../components/Segmented';
import { useTabBarHeight } from '../../components/TabBar';
import { useRides, RideRecord } from '../../store/useRides';
import { clockAt, dayLabel, naira } from '../../utils/format';
import { colors, space, radius, type } from '../../theme';

type Filter = 'all' | 'cancelled';

function RideCard({ ride }: { ride: RideRecord }) {
  const cancelled = ride.status === 'cancelled';
  return (
    <Pressable
      // Dynamic route: the same screen file shows whichever ride we pass in.
      onPress={() => router.push({ pathname: '/rides/[id]', params: { id: ride.id } })}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.cardTop}>
        <Text style={styles.when}>
          {dayLabel(ride.startedAt).toUpperCase()} · {clockAt(ride.startedAt)}
        </Text>
        <Chip variant={cancelled ? 'error' : 'accent'} label={cancelled ? 'Cancelled' : 'Completed'} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.vehicleIcon}>
          <Icon name={ride.rideType === 'keke' ? 'keke' : 'car'} size={22} color={colors.icon.accent} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.title} numberOfLines={1}>{ride.destinationName}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            From {ride.pickupName} · {ride.rideType === 'keke' ? 'Keke' : 'Cab'}
          </Text>
        </View>
        <Text style={[styles.price, cancelled && { color: colors.text.tertiary }]}>{naira(ride.charged)}</Text>
      </View>
    </Pressable>
  );
}

export default function Rides() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const rides = useRides((s) => s.rides);
  const [filter, setFilter] = useState<Filter>('all');

  const shown = filter === 'all' ? rides : rides.filter((r) => r.status === 'cancelled');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.lg }]}>
      <View style={styles.header}>
        <Text style={styles.heading}>Your rides</Text>
        <Segmented
          options={[
            { value: 'all', label: 'All' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </View>

      <FlatList
        data={shown}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <RideCard ride={item} />}
        ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
        // The tab bar floats over the list, so leave room for it at the bottom.
        contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + space.xl }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="rides" size={40} color={colors.icon.muted} />
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'No rides yet. Your trips will show up here.' : 'No cancelled rides.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  header: { paddingHorizontal: space.xl, gap: space.lg, paddingBottom: space.lg },
  heading: { ...type.h1, color: colors.text.primary },
  list: { paddingHorizontal: space.xl },
  card: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  when: { ...type.overline, color: colors.text.tertiary },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.bodyStrong, color: colors.text.primary },
  meta: { ...type.caption, color: colors.text.secondary },
  price: { ...type.bodyStrong, color: colors.text.primary },
  empty: { alignItems: 'center', gap: space.md, paddingVertical: space['5xl'] },
  emptyText: { ...type.body, color: colors.text.tertiary, textAlign: 'center' },
});