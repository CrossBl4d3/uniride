// src/app/booking/confirm.tsx — 14 Confirm & pay
import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Radio } from '../../components/Radio';
import { campuses } from '../../data/campuses';
import { rideTypes } from '../../data/rides';
import { paymentMethods } from '../../data/payments';
import { useUser } from '../../store/useUser';
import { useBooking } from '../../store/useBooking';
import { useTrip } from '../../store/useTrip';
import { useUI } from '../../store/useUI';
import { useWallet } from '../../store/useWallet';
import { parseKm, fareFor, tripMinutes, priceBreakdown } from '../../utils/fare';
import { clockIn, naira } from '../../utils/format';
import { routeTo } from '../../utils/route';
import { colors, space, radius, type } from '../../theme';

export default function ConfirmAndPay() {
  const insets = useSafeAreaInsets();
  const [paying, setPaying] = useState(false);

  const email = useUser((s) => s.email);
  const campusId = useUser((s) => s.campusId);
  const pickup = useBooking((s) => s.pickup);
  const destination = useBooking((s) => s.destination);
  const rideType = useBooking((s) => s.rideType);
  const paymentMethod = useBooking((s) => s.paymentMethod);
  const setPaymentMethod = useBooking((s) => s.setPaymentMethod);
  const startTrip = useTrip((s) => s.start);
  const setSheetExpanded = useUI((s) => s.setSheetExpanded);
  const balance = useWallet((s) => s.balance);

  if (!destination) return null;

  const ride = rideTypes.find((r) => r.id === rideType) ?? rideTypes[0];
  const km = parseKm(destination.distance);
  const tripMin = tripMinutes(km);
  const isStudent = email.toLowerCase().endsWith('.edu.ng');
  const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];
  const discountCode = `${campus.id.toUpperCase()}-STUDENT`;
  const price = priceBreakdown(fareFor(ride.id, km), isStudent);
  const walletTooLow = paymentMethod === 'wallet' && balance < price.total;
  const method = paymentMethods.find((m) => m.id === paymentMethod) ?? paymentMethods[0];

  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);

      const start = { latitude: campus.latitude, longitude: campus.longitude };
      startTrip({
        rideType: ride.id,
        route: routeTo(start, km, destination),
        fare: price.fare,
        fee: price.fee,
        discount: price.discount,
        total: price.total,
        paidWith: method.id === 'cash' ? 'Cash' : method.title,
        pickupName: pickup.area,
        destinationName: destination.name,
        km,
        tripMin,
        awayMin: ride.awayMin,
      });

      setSheetExpanded(false);
      if (router.canDismiss()) router.dismissAll();
      router.push('/trip');
    }, 1500);
  };

  return (
    <View style={styles.screen}>
      <TopBar title="Confirm & pay" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.routeRow}>
            <View style={styles.routeLine}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.square} />
            </View>
            <View style={styles.stops}>
              <View>
                <Text style={styles.label}>Pickup</Text>
                <Text style={styles.value} numberOfLines={1}>{pickup.area}</Text>
              </View>
              <View>
                <Text style={styles.label}>Destination</Text>
                <Text style={styles.value} numberOfLines={1}>{destination.name}</Text>
              </View>
            </View>
          </View>
          <View style={styles.summaryFooter}>
            <Text style={styles.label}>
              {ride.name} · {ride.seats} seats · ETA {clockIn(ride.awayMin + tripMin)}
            </Text>
            <Text style={styles.accent}>{tripMin} min</Text>
          </View>
        </View>

        <Text style={styles.overline}>Payment method</Text>
        <View style={styles.methods}>
          {paymentMethods.map((m) => {
            const selected = m.id === paymentMethod;
            const lowBalance = m.id === 'wallet' && balance < price.total;
            const subtitle = m.id === 'wallet' ? `Balance ${naira(balance)}` : m.subtitle;
            return (
              <Pressable
                key={m.id}
                onPress={() => setPaymentMethod(m.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.method, selected && styles.methodSelected, selected && lowBalance && styles.methodError]}
              >
                <View style={styles.methodIcon}>
                  <Icon name={m.icon} size={22} color={colors.icon.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.value}>{m.title}</Text>
                  <Text style={[styles.label, lowBalance && { color: colors.status.error }]}>
                    {lowBalance ? `${subtitle} · not enough for this trip` : subtitle}
                  </Text>
                </View>
                <Radio selected={selected} />
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, styles.fare]}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Trip fare</Text>
            <Text style={styles.value}>{naira(price.fare)}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Booking fee</Text>
            <Text style={styles.value}>{naira(price.fee)}</Text>
          </View>
          {price.discount > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Student discount · {discountCode}</Text>
              <Text style={[styles.value, { color: colors.text.accent }]}>−{naira(price.discount)}</Text>
            </View>
          )}
          <View style={[styles.fareRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>{naira(price.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.md }]}>
        {walletTooLow ? (
          <Button
            label={`Top up wallet · need ${naira(price.total - balance)} more`}
            fullWidth
            icon={<Icon name="plus" size={18} color={colors.text.onAccent} />}
            onPress={() => router.push('/top-up')}
          />
        ) : (
          <Button
            label={method.id === 'cash' ? 'Book ride' : `Pay ${naira(price.total)}`}
            fullWidth
            loading={paying}
            onPress={pay}
          />
        )}
        <View style={styles.secure}>
          <Icon name="shield" size={14} color={colors.icon.muted} />
          <Text style={styles.label}>Payments are encrypted and processed securely</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space['2xl'], gap: space.lg },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
    padding: space.lg,
  },
  routeRow: { flexDirection: 'row', gap: space.lg },
  routeLine: { alignItems: 'center', paddingVertical: 24 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.bg.accent },
  line: { width: 2, flex: 1, marginVertical: space.xs, backgroundColor: colors.border.default },
  square: { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.text.primary },
  stops: { flex: 1, gap: space.lg },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
  label: { ...type.caption, color: colors.text.secondary },
  value: { ...type.bodyStrong, color: colors.text.primary },
  accent: { ...type.captionStrong, color: colors.text.accent },
  overline: { ...type.overline, color: colors.text.secondary, marginTop: space.sm },
  methods: { gap: space.sm, marginTop: -space.sm },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  methodSelected: { borderWidth: 1.5, borderColor: colors.border.focus, backgroundColor: colors.bg.surfaceRaised },
  methodError: { borderColor: colors.status.error },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bg.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fare: { gap: space.sm, borderRadius: 20 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareLabel: { ...type.body, color: colors.text.secondary, flexShrink: 1 },
  totalRow: { marginTop: space.sm, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.border.hairline },
  totalText: { ...type.bodyStrong, color: colors.text.primary },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.md },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
});