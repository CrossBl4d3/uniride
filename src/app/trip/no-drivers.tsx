// src/app/trip/no-drivers.tsx — 22 No Kekes available
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { rideTypes } from '../../data/rides';
import { useTrip } from '../../store/useTrip';
import { useUser } from '../../store/useUser';
import { useBooking } from '../../store/useBooking';
import { fareFor, priceBreakdown } from '../../utils/fare';
import { naira } from '../../utils/format';
import { colors, space, radius, type } from '../../theme';

export default function NoDrivers() {
  const insets = useSafeAreaInsets();
  const trip = useTrip();
  const email = useUser((s) => s.email);
  const setRideType = useBooking((s) => s.setRideType);

  const wasKeke = trip.rideType === 'keke';
  const vehicles = wasKeke ? 'Kekes' : 'Cabs';
  const isStudent = email.toLowerCase().endsWith('.edu.ng');
  const cab = rideTypes.find((r) => r.id === 'cab') ?? rideTypes[1];
  const cabTotal = priceBreakdown(fareFor('cab', trip.km), isStudent).total;
  const refundLine =
    trip.paidWith === 'Cash'
      ? 'You haven’t been charged.'
      : `Your ${naira(trip.total)} has been refunded to your ${trip.paidWith}.`;

  const leave = () => {
    trip.end();
    if (router.canDismiss()) router.dismissAll();
  };
  const tryAgain = () => {
    trip.retry();
    router.replace('/trip');
  };
  const bookCab = () => {
    setRideType('cab'); // the destination is still in the booking store
    router.replace('/booking/confirm');
  };

  return (
    <View style={styles.screen}>
      <TopBar onLeadingPress={leave} />

      <View style={styles.content}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <Icon name="car" size={56} color={colors.icon.accent} />
          </View>
        </View>

        <Text style={styles.title}>No {vehicles} nearby right now</Text>
        <Text style={styles.body}>
          All {vehicles} around {trip.pickupName} are busy. {refundLine}
        </Text>

        {wasKeke && (
          <View style={styles.banner}>
            <Icon name="alert" size={20} color={colors.status.warning} />
            <Text style={styles.bannerText}>
              Demand is high on campus. A cab can pick you up in about {cab.awayMin} min.
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + space.lg }]}>
        {wasKeke && <Button label={`Book a Cab · ${naira(cabTotal)}`} fullWidth onPress={bookCab} />}
        <Button label="Try again" variant={wasKeke ? 'secondary' : 'primary'} fullWidth onPress={tryAgain} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { alignItems: 'center', gap: space.md, paddingHorizontal: space.xl, marginTop: space['3xl'] },
  outerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: space.xl,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.h1, color: colors.text.primary, textAlign: 'center' },
  body: { ...type.body, color: colors.text.secondary, textAlign: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    alignSelf: 'stretch',
    marginTop: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.warningSubtle,
  },
  bannerText: { ...type.caption, color: colors.text.primary, flex: 1 },
  actions: { marginTop: 'auto', paddingHorizontal: space.xl, gap: space.sm },
});