// src/app/trip/cancel.tsx — 21 Cancel ride
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Radio } from '../../components/Radio';
import { useTrip, FREE_CANCEL_SECONDS, CANCEL_FEE } from '../../store/useTrip';
import { naira } from '../../utils/format';
import { colors, space, radius, type } from '../../theme';

const reasons = [
  'Driver is taking too long',
  'I booked by mistake',
  'I found another ride',
  'Driver asked me to cancel',
  'Something else',
];

const duration = (s: number) => (s >= 60 ? `${Math.round(s / 60)} minutes` : `${s} seconds`);

export default function CancelRide() {
  const insets = useSafeAreaInsets();
  const trip = useTrip();
  const [reason, setReason] = useState<string | null>(null);

  const show = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(show, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [show]);

  const close = (then: () => void) => {
    Animated.timing(show, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => then());
  };

  useEffect(() => {
    if (trip.status === 'onTrip' || trip.status === 'complete' || trip.status === 'noDrivers') router.back();
  }, [trip.status]);

  const driver = trip.driver;
  const searching = trip.status === 'searching' || !driver;
  const secondsSinceBooking = (Date.now() - trip.bookedAt) / 1000;
  const free = searching || secondsSinceBooking < FREE_CANCEL_SECONDS;
  const paidCash = trip.paidWith === 'Cash';
  const refundTo =
    trip.paidWith === 'UniRide Wallet' ? 'your wallet' : trip.paidWith === 'Debit card' ? 'your card' : 'your bank account';
  const eta = Math.max(1, Math.ceil((1 - trip.progress) * trip.awayMin));

  const who = searching
    ? 'We’re still finding your driver.'
    : trip.status === 'arrived'
    ? `${driver!.firstName} is waiting for you at ${trip.pickupName}.`
    : `${driver!.firstName} is ${eta} min away.`;

  const freeRule = searching
    ? 'Cancelling now is free'
    : `Cancelling within ${duration(FREE_CANCEL_SECONDS)} of booking is free`;

  const money = paidCash
    ? free
      ? `${freeRule}.`
      : `A ${naira(CANCEL_FEE)} cancellation fee will be added to your next ride.`
    : free
    ? `${freeRule}, and ${naira(trip.total)} goes back to ${refundTo}.`
    : `A ${naira(CANCEL_FEE)} cancellation fee applies, so ${naira(trip.total - CANCEL_FEE)} goes back to ${refundTo}.`;

  const keep = () => close(() => router.back());
  const cancel = () =>
    close(() => {
      trip.cancel(free ? 0 : CANCEL_FEE); // saves it to your ride history, then finishes
      if (router.canDismiss()) router.dismissAll();
    });

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.backdrop, { opacity: show }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={keep} accessibilityLabel="Keep my ride" />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + space.lg,
            transform: [{ translateY: show.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }],
          },
        ]}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Cancel this ride?</Text>
        <Text style={styles.body}>
          {who} {money}
        </Text>

        <Text style={styles.overline}>Tell us why</Text>
        <View>
          {reasons.map((r, i) => (
            <Pressable
              key={r}
              onPress={() => setReason(r)}
              accessibilityRole="radio"
              accessibilityState={{ selected: reason === r }}
              style={[styles.reason, i < reasons.length - 1 && styles.divider]}
            >
              <Text style={styles.reasonText}>{r}</Text>
              <Radio selected={reason === r} />
            </Pressable>
          ))}
        </View>

        <Button label="Cancel ride" variant="danger" fullWidth disabled={!reason} onPress={cancel} />
        <Button label="Keep my ride" variant="secondary" fullWidth onPress={keep} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.overlay,
  },
  sheet: {
    gap: space.md,
    paddingHorizontal: space.xl,
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    marginTop: space.sm,
    backgroundColor: colors.border.strong,
  },
  title: { ...type.h2, color: colors.text.primary },
  body: { ...type.body, color: colors.text.secondary },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space.sm },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border.hairline },
  reasonText: { ...type.bodyLarge, color: colors.text.primary },
});