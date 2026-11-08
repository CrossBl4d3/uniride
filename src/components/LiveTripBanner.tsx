// src/components/LiveTripBanner.tsx — the Figma "Banner/Live trip" (6 states)
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Icon, IconName } from './Icon';
import { ProgressBar } from './ProgressBar';
import { useTrip, TripStatus } from '../store/useTrip';
import { useSafety } from '../store/useSafety';
import { useMorph } from '../store/useMorph';
import { clockAt, naira } from '../utils/format';
import { colors, space, radius, type } from '../theme';

export function liveTripHref(status: TripStatus) {
  if (status === 'complete') return '/trip/rate' as const;
  if (status === 'noDrivers') return '/trip/no-drivers' as const;
  return '/trip' as const;
}

export function LiveTripBanner() {
  const trip = useTrip();
  const tripPin = useSafety((s) => s.tripPin);
  const { status, driver, progress } = trip;

  const vehicle = trip.rideType === 'keke' ? 'Keke' : 'Cab';
  const plateLine = driver ? `${vehicle} · ${driver.plate} · ${driver.color}` : vehicle;
  const etaToYou = Math.max(1, Math.ceil((1 - progress) * trip.awayMin));
  const minutesLeft = Math.max(1, Math.ceil((1 - progress) * trip.tripMin));
  const kmLeft = ((1 - progress) * trip.km).toFixed(1);

  let lead: { initials?: string; icon?: IconName; bg: string; color: string } = {
    bg: colors.bg.accentSubtle,
    color: colors.icon.accent,
  };
  let title = '';
  let subtitle = '';
  let pill: string | null = null;
  let bar: number | null = null;

  switch (status) {
    case 'searching':
      lead.icon = 'search';
      title = 'Finding your driver…';
      subtitle = `${vehicle} to ${trip.destinationName}`;
      break;
    case 'found':
      lead.initials = driver?.initials;
      title = `${driver?.firstName} accepted your ride`;
      subtitle = plateLine;
      pill = `${trip.awayMin} min`;
      break;
    case 'arriving':
      lead.initials = driver?.initials;
      title = `${driver?.firstName} is on the way`;
      subtitle = plateLine;
      pill = `${etaToYou} min`;
      bar = progress;
      break;
    case 'arrived':
      lead.initials = driver?.initials;
      title = `${driver?.firstName} is here`;
      subtitle = `Meet at ${trip.pickupName} · ${tripPin ? `PIN ${trip.pin}` : driver?.plate}`;
      pill = 'Here';
      break;
    case 'onTrip':
      lead.icon = 'navigation';
      title = `On trip to ${trip.destinationName}`;
      subtitle = `Arriving at ${clockAt(trip.arriveAt)} · ${kmLeft} km left`;
      pill = `${minutesLeft} min`;
      bar = progress;
      break;
    case 'complete':
      lead = { icon: 'check', bg: colors.bg.accent, color: colors.text.onAccent };
      title = 'You’ve arrived';
      subtitle = `Tap to rate your ride with ${driver?.firstName ?? 'your driver'}`;
      break;
    case 'noDrivers':
      lead = { icon: 'alert', bg: colors.bg.warningSubtle, color: colors.status.warning };
      title = `No ${vehicle}s nearby`;
      subtitle = trip.paidWith === 'Cash' ? 'Tap for options' : `${naira(trip.total)} refunded · tap for options`;
      break;
    default:
      return null;
  }

  const open = () => {
    const href = liveTripHref(status);
    if (href === '/trip') useMorph.getState().openTrip(); // grow the banner into full tracking
    else router.push(href);
  };

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}. Open ride`}
      style={({ pressed }) => [styles.banner, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.row}>
        <View style={[styles.lead, { backgroundColor: lead.bg }]}>
          {lead.initials ? (
            <Text style={styles.initials}>{lead.initials}</Text>
          ) : (
            <Icon name={lead.icon ?? 'car'} size={20} color={lead.color} />
          )}
        </View>
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        {pill ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{pill}</Text>
          </View>
        ) : (
          <Icon name="chevron-right" size={20} color={colors.icon.muted} />
        )}
      </View>
      {bar !== null && <ProgressBar value={bar} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: 10,
    paddingVertical: space.md,
    paddingLeft: space.md,
    paddingRight: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.brand,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  lead: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  initials: { ...type.captionStrong, color: colors.text.accent },
  text: { flex: 1, gap: 2 },
  title: { ...type.bodyStrong, color: colors.text.primary },
  subtitle: { ...type.caption, color: colors.text.secondary },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.bg.accent },
  pillText: { ...type.captionStrong, color: colors.text.onAccent },
});