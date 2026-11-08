// src/app/trip/found.tsx — 16 Driver found
import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { DriverCard } from '../../components/DriverCard';
import { useTrip } from '../../store/useTrip';
import { useMorph } from '../../store/useMorph';
import { naira } from '../../utils/format';
import { colors, space, radius, type } from '../../theme';

export default function DriverFound() {
  const insets = useSafeAreaInsets();
  const trip = useTrip();
  const driver = trip.driver;
  const left = useRef(false);

  useEffect(() => {
    if (trip.status !== 'found' && !left.current) {
      left.current = true;
      router.back();
    }
  }, [trip.status]);

  if (!driver) return null;

  const paidLine =
    trip.paidWith === 'Cash'
      ? `Pay ${naira(trip.total)} in cash when you arrive.`
      : `${naira(trip.total)} was paid from your ${trip.paidWith}.`;

  // Shrink into the banner, closing this AND the tracking screen underneath.
  const minimise = () => {
    useMorph.getState().closeTrip(() => {
      left.current = true;
      if (router.canDismiss()) router.dismiss(2);
      else router.replace('/home');
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space['4xl'], paddingBottom: insets.bottom + space.lg }]}>
      <Pressable
        style={[styles.minimise, { top: insets.top + space.sm }]}
        onPress={minimise}
        accessibilityLabel="Minimise"
        hitSlop={8}
      >
        <Icon name="chevron-down" />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.tick}>
          <Icon name="check" size={40} color={colors.text.onAccent} strokeWidth={2.4} />
        </View>
        <Text style={styles.title}>Driver found</Text>
        <Text style={styles.body}>
          {driver.firstName} accepted your ride and is {trip.awayMin} min away. {paidLine}
        </Text>

        <View style={styles.card}>
          <DriverCard
            driver={driver}
            framed={false}
            onMessage={() => router.push('/trip/chat')}
            onCall={() => Linking.openURL(`tel:${driver.phone}`)}
          />
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Arriving in</Text>
            <Text style={styles.accent}>{trip.awayMin} min</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.value}>{trip.pickupName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt</Text>
            <Text style={styles.value}>{trip.receipt}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label="Track my ride"
          fullWidth
          icon={<Icon name="navigation" size={18} color={colors.text.onAccent} />}
          onPress={() => trip.track()}
        />
        <Button
          label="View receipt"
          variant="ghost"
          fullWidth
          onPress={() => Alert.alert('Receipt', `${trip.receipt}\n${naira(trip.total)} · ${trip.paidWith}`)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen, paddingHorizontal: space.xl },
  minimise: {
    position: 'absolute',
    left: space.xl,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  content: { alignItems: 'center', gap: space.md },
  tick: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.bg.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  title: { ...type.h1, color: colors.text.primary, textAlign: 'center' },
  body: { ...type.body, color: colors.text.secondary, textAlign: 'center' },
  card: {
    alignSelf: 'stretch',
    gap: space.md,
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  divider: { height: 1, backgroundColor: colors.border.hairline },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { ...type.body, color: colors.text.secondary },
  value: { ...type.bodyStrong, color: colors.text.primary },
  accent: { ...type.bodyStrong, color: colors.text.accent },
  actions: { marginTop: 'auto', gap: space.sm },
});