// src/app/rides/[id].tsx — 24 Trip details: Receipt
// The [id] in the file name is filled in by whichever ride you tapped.
import { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Share, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { MapPin } from '../../components/MapPin';
import { DriverCard } from '../../components/DriverCard';
import { campuses } from '../../data/campuses';
import { searchablePlaces, Place } from '../../data/places';
import { useRides } from '../../store/useRides';
import { useUser } from '../../store/useUser';
import { useBooking } from '../../store/useBooking';
import { usePlaces } from '../../store/usePlaces';
import { useTrip, isLive } from '../../store/useTrip';
import { useMorph } from '../../store/useMorph';
import { distanceKm } from '../../utils/route';
import { clockAt, dayLabel, naira } from '../../utils/format';
import { darkMapStyle } from '../../theme/mapStyle';
import { colors, space, radius, type } from '../../theme';

export default function TripDetails() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const ride = useRides((s) => s.rides.find((r) => r.id === id));
  const campusId = useUser((s) => s.campusId);
  const saved = usePlaces((s) => s.saved);
  const tripStatus = useTrip((s) => s.status);

  if (!ride) {
    return (
      <View style={styles.screen}>
        <TopBar title="Trip details" />
        <Text style={styles.missing}>We couldn’t find that ride.</Text>
      </View>
    );
  }

  const cancelled = ride.status === 'cancelled';
  const vehicle = ride.rideType === 'keke' ? 'Keke' : 'Cab';
  const start = ride.route[0];
  const end = ride.route[ride.route.length - 1];
  const when =
    `${dayLabel(ride.startedAt)} · ${clockAt(ride.startedAt)}` +
    (cancelled ? '' : ` – ${clockAt(ride.endedAt)}`) +
    ` · ${ride.km.toFixed(1)} km`;
  const refunded = ride.total - ride.charged;

  const shareReceipt = () =>
    Share.share({
      message: [
        `UniRide receipt #${ride.id}`,
        `${ride.pickupName} → ${ride.destinationName}`,
        `${dayLabel(ride.startedAt)}, ${clockAt(ride.startedAt)} · ${vehicle}`,
        cancelled ? `Cancelled · charged ${naira(ride.charged)}` : `Paid ${naira(ride.total)} with ${ride.paidWith}`,
      ].join('\n'),
    });

  // Book the same trip again: same destination and vehicle, picked up from where you are now.
  const rebook = () => {
    // One ride at a time.
    if (isLive(tripStatus)) {
      Alert.alert('You’re already on a ride', 'Finish or cancel your current ride before booking another.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open my ride', onPress: () => useMorph.getState().openTrip() },
      ]);
      return;
    }

    // A place we know (from search or your saved places)? Use it exactly as it was.
    // Otherwise (e.g. a dropped pin), go to the exact spot the last trip ended.
    const known =
      searchablePlaces.find((p) => p.name === ride.destinationName) ??
      saved.find((s) => s.place.name === ride.destinationName)?.place;
    const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];
    const here = { latitude: campus.latitude, longitude: campus.longitude };
    const destination: Place = known ?? {
      id: `rebook-${ride.id}`,
      name: ride.destinationName,
      area: 'From your trip history',
      distance: `${(distanceKm(here, end) * 1.3).toFixed(1)} km`, // roads are longer than a straight line
      latitude: end.latitude,
      longitude: end.longitude,
    };

    const booking = useBooking.getState();
    booking.reset(); // pickup goes back to your current location
    booking.setDestination(destination);
    booking.setRideType(ride.rideType);
    router.push('/booking/ride');
  };

  return (
    <View style={styles.screen}>
      <TopBar title="Trip details" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapCard} pointerEvents="none">
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{ ...start, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
            onMapReady={() =>
              mapRef.current?.fitToCoordinates(ride.route, {
                edgePadding: { top: 50, bottom: 30, left: 40, right: 40 },
                animated: false,
              })
            }
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            userInterfaceStyle="dark"
            customMapStyle={darkMapStyle}
            showsPointsOfInterests={false}
            toolbarEnabled={false}
          >
            <Polyline coordinates={ride.route} strokeColor={colors.bg.canvas} strokeWidth={8} lineCap="round" lineJoin="round" />
            <Polyline
              coordinates={ride.route}
              strokeColor={cancelled ? colors.text.tertiary : colors.map.route}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
              lineDashPattern={cancelled ? [6, 6] : undefined}
            />
            <Marker coordinate={start} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
              <View style={styles.startDot} />
            </Marker>
            <Marker coordinate={end} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
              <MapPin size={28} />
            </Marker>
          </MapView>
        </View>

        <View style={styles.card}>
          <View style={styles.routeRow}>
            <View style={styles.routeLine}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.square} />
            </View>
            <View style={{ flex: 1, gap: space.md }}>
              <View>
                <Text style={styles.label}>Pickup</Text>
                <Text style={styles.value}>{ride.pickupName}</Text>
              </View>
              <View>
                <Text style={styles.label}>Destination</Text>
                <Text style={styles.value}>{ride.destinationName}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.label}>{when}</Text>
            <Text style={cancelled ? styles.error : styles.accent}>{cancelled ? 'Cancelled' : `${ride.minutes} min`}</Text>
          </View>
        </View>

        {ride.driver && (
          <View style={{ gap: space.sm }}>
            <DriverCard driver={ride.driver} />
            <Text style={styles.note}>
              Lost something or need to reach {ride.driver.firstName}? Use Get help below.
            </Text>
          </View>
        )}

        <View style={[styles.card, { gap: space.sm }]}>
          {cancelled ? (
            <>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Cancellation fee</Text>
                <Text style={styles.value}>{naira(ride.charged)}</Text>
              </View>
              {ride.paidWith !== 'Cash' && (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Refunded to {ride.paidWith}</Text>
                  <Text style={[styles.value, { color: colors.text.accent }]}>{naira(refunded)}</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Trip fare</Text>
                <Text style={styles.value}>{naira(ride.fare)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Booking fee</Text>
                <Text style={styles.value}>{naira(ride.fee)}</Text>
              </View>
              {ride.discount > 0 && (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Student discount</Text>
                  <Text style={[styles.value, { color: colors.text.accent }]}>−{naira(ride.discount)}</Text>
                </View>
              )}
              <View style={[styles.row, styles.totalRow]}>
                <Text style={styles.value}>Paid with {ride.paidWith}</Text>
                <Text style={styles.value}>{naira(ride.total)}</Text>
              </View>
            </>
          )}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Receipt</Text>
            <Text style={styles.value}>#{ride.id}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.md }]}>
        <Button
          label="Book this ride again"
          fullWidth
          icon={<Icon name={ride.rideType === 'keke' ? 'keke' : 'car'} size={18} color={colors.text.onAccent} />}
          onPress={rebook}
        />
        <View style={styles.row2}>
          <Button label="Share receipt" variant="secondary" icon={<Icon name="share" size={18} />} onPress={shareReceipt} style={styles.half} />
          <Button
            label="Get help"
            variant="secondary"
            icon={<Icon name="help" size={18} />}
            onPress={() => router.push({ pathname: '/help', params: { rideId: ride.id } })}
            style={styles.half}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space['2xl'], gap: space.md },
  missing: { ...type.body, color: colors.text.secondary, textAlign: 'center', marginTop: space['3xl'] },
  mapCard: { height: 200, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.bg.surface },
  startDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.text.primary,
    backgroundColor: colors.bg.accent,
  },
  card: {
    padding: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  routeRow: { flexDirection: 'row', gap: space.lg },
  routeLine: { alignItems: 'center', paddingVertical: 22 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.bg.accent },
  line: { width: 2, flex: 1, marginVertical: space.xs, backgroundColor: colors.border.default },
  square: { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.text.primary },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.md,
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
  label: { ...type.caption, color: colors.text.secondary, flexShrink: 1 },
  value: { ...type.bodyStrong, color: colors.text.primary },
  accent: { ...type.captionStrong, color: colors.text.accent },
  error: { ...type.captionStrong, color: colors.status.error },
  note: { ...type.caption, color: colors.text.tertiary, paddingHorizontal: space.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { ...type.body, color: colors.text.secondary },
  totalRow: { marginTop: space.xs, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.border.hairline },
  bottom: { gap: space.sm, paddingHorizontal: space.xl, paddingTop: space.md },
  row2: { flexDirection: 'row', gap: space.md },
  half: { flex: 1 },
});