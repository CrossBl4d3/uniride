// src/app/trip/index.tsx — 15 Finding · 17 On the way · 18 Arrived · 19 Trip in progress
// ONE map screen; the sheet and markers change with the trip's status.
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Linking, Share, BackHandler } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { MapPin } from '../../components/MapPin';
import { RiderMarker, VehicleMarker } from '../../components/MapMarkers';
import { DriverCard } from '../../components/DriverCard';
import { ProgressBar } from '../../components/ProgressBar';
import { useTrip } from '../../store/useTrip';
import { useSafety } from '../../store/useSafety';
import { pointAlong, LatLng } from '../../utils/route';
import { clockAt, clockIn, naira } from '../../utils/format';
import { darkMapStyle } from '../../theme/mapStyle';
import { colors, space, radius, type } from '../../theme';

function SearchPulse() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.pulseWrap}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
          },
        ]}
      />
      <RiderMarker />
    </View>
  );
}

function RouteSummary({ pickup, destination, footer, footerRight }: {
  pickup: string; destination: string; footer?: string; footerRight?: string;
}) {
  return (
    <View style={styles.summary}>
      <View style={styles.summaryRow}>
        <View style={styles.routeLine}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <View style={styles.square} />
        </View>
        <View style={{ flex: 1, gap: space.md }}>
          <View>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.value} numberOfLines={1}>{pickup}</Text>
          </View>
          <View>
            <Text style={styles.label}>Destination</Text>
            <Text style={styles.value} numberOfLines={1}>{destination}</Text>
          </View>
        </View>
      </View>
      {footer && (
        <View style={styles.summaryFooter}>
          <Text style={styles.label}>{footer}</Text>
          {footerRight && <Text style={styles.accentText}>{footerRight}</Text>}
        </View>
      )}
    </View>
  );
}

export default function Trip() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);

  const trip = useTrip();
  const { status, route, approach, driver, progress } = trip;
  const shareTrips = useSafety((s) => s.shareTrips);
  const tripPin = useSafety((s) => s.tripPin);
  const contacts = useSafety((s) => s.contacts);

  const pickup = route[0];
  const destination = route[route.length - 1];
  const rideName = trip.rideType === 'keke' ? 'Keke' : 'Cab';
  const paidCash = trip.paidWith === 'Cash';
  const canCancel = status === 'searching' || status === 'found' || status === 'arriving' || status === 'arrived';
  const openCancel = () => router.push('/trip/cancel');

  // Who automatically gets a live link (the "Share trips automatically" switch).
  const sharedWith = shareTrips ? contacts.filter((c) => c.everyTrip).map((c) => c.name.split(' ')[0]) : [];

  useFocusEffect(
    useCallback(() => {
      if (status === 'found') router.push('/trip/found');
      if (status === 'complete') router.replace('/trip/rate');
      if (status === 'noDrivers') router.replace('/trip/no-drivers');
    }, [status])
  );

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canCancel) router.push('/trip/cancel');
        return true;
      });
      return () => sub.remove();
    }, [canCancel])
  );

  useEffect(() => {
    if (!mapReady || !sheetHeight || !pickup) return;
    const padding = { top: insets.top + 120, bottom: sheetHeight + 40, left: 70, right: 70 };
    const focus = status === 'arriving' ? approach : status === 'onTrip' ? route : null;
    if (focus) {
      mapRef.current?.fitToCoordinates(focus, { edgePadding: padding, animated: true });
    } else {
      mapRef.current?.animateToRegion(
        { latitude: pickup.latitude - 0.0025, longitude: pickup.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        500
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, sheetHeight, status]);

  if (!pickup || status === 'idle') return null;

  const vehicle: LatLng | null =
    status === 'arriving' ? pointAlong(approach, progress)
    : status === 'arrived' ? pickup
    : status === 'onTrip' ? pointAlong(route, progress)
    : null;

  const etaToYou = Math.max(1, Math.ceil((1 - progress) * trip.awayMin));
  const minutesLeft = Math.max(1, Math.ceil((1 - progress) * trip.tripMin));
  const kmLeft = ((1 - progress) * trip.km).toFixed(1);
  const arrival = trip.arriveAt ? clockAt(trip.arriveAt) : clockIn(etaToYou + trip.tripMin);

  const call = () => driver && Linking.openURL(`tel:${driver.phone}`);
  const message = () => router.push('/trip/chat');
  const safety = () => router.push('/safety');
  const shareTrip = () =>
    Share.share({
      message: `I'm on a UniRide ${rideName} to ${trip.destinationName}. Driver: ${driver?.name ?? '—'}, ${
        driver?.plate ?? ''
      }. Arriving around ${arrival}.`,
    });

  const topText =
    status === 'arriving' ? (paidCash ? `Pay ${naira(trip.total)} in cash` : `Payment confirmed · ${naira(trip.total)}`)
    : status === 'arrived' ? `Your ${rideName} is here`
    : status === 'onTrip' ? 'On trip'
    : null;

  const sharedChip =
    sharedWith.length > 0 ? <Chip icon="share" label={`Shared live with ${sharedWith.join(', ')}`} /> : null;

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...pickup, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        onMapReady={() => setMapReady(true)}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
        showsPointsOfInterest={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {status === 'arriving' && (
          <>
            <Polyline coordinates={approach} strokeColor={colors.bg.canvas} strokeWidth={9} lineCap="round" lineJoin="round" />
            <Polyline coordinates={approach} strokeColor={colors.map.route} strokeWidth={5} lineCap="round" lineJoin="round" />
          </>
        )}
        {status === 'onTrip' && (
          <>
            <Polyline coordinates={route} strokeColor={colors.bg.canvas} strokeWidth={9} lineCap="round" lineJoin="round" />
            <Polyline coordinates={route} strokeColor={colors.map.route} strokeWidth={5} lineCap="round" lineJoin="round" />
            <Marker coordinate={destination} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
              <MapPin size={34} />
            </Marker>
          </>
        )}

        {(status === 'searching' || status === 'found') && (
          <Marker coordinate={pickup} anchor={{ x: 0.5, y: 0.5 }}>
            <SearchPulse />
          </Marker>
        )}
        {(status === 'arriving' || status === 'arrived') && (
          <Marker coordinate={pickup} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <RiderMarker />
          </Marker>
        )}

        {vehicle && (
          <Marker coordinate={vehicle} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <VehicleMarker />
          </Marker>
        )}
      </MapView>

      <View style={[styles.top, { top: insets.top + space.sm }]}>
        {topText && (
          <View style={styles.pill}>
            <Icon name={status === 'onTrip' ? 'navigation' : 'check'} size={14} color={colors.text.accent} />
            <Text style={styles.pillText}>{topText}</Text>
          </View>
        )}
        {status === 'onTrip' && (
          <Pressable style={styles.sos} onPress={() => router.push('/sos')} accessibilityLabel="Emergency SOS">
            <Icon name="sos" size={16} color={colors.status.error} />
            <Text style={styles.sosText}>SOS</Text>
          </Pressable>
        )}
      </View>

      <View
        style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}
        onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.handle} />

        {(status === 'searching' || status === 'found') && (
          <>
            <Text style={styles.title}>Finding your driver…</Text>
            <Text style={styles.body}>Matching you with a nearby {rideName}. This usually takes less than a minute.</Text>
            <ProgressBar />
            <RouteSummary
              pickup={trip.pickupName}
              destination={trip.destinationName}
              footer={`${rideName} · ${naira(trip.total)} ${paidCash ? 'in cash' : `paid from ${trip.paidWith}`}`}
              footerRight={`${trip.tripMin} min`}
            />
            <Button label="Cancel request" variant="danger" fullWidth onPress={openCancel} />
          </>
        )}

        {status === 'arriving' && driver && (
          <>
            <View style={styles.headRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{driver.firstName} is on the way</Text>
                <Text style={styles.body}>Arriving at {trip.pickupName} in {etaToYou} min</Text>
              </View>
              <View style={styles.plate}>
                <Text style={styles.plateText}>{driver.plate}</Text>
                <Text style={styles.plateSub}>{driver.color}</Text>
              </View>
            </View>
            {sharedChip}
            <DriverCard driver={driver} onMessage={message} onCall={call} />
            <View style={styles.actions}>
              <Button label="Share" size="small" variant="secondary" icon={<Icon name="share" size={16} />} onPress={shareTrip} style={styles.action} />
              <Button label="Safety" size="small" variant="secondary" icon={<Icon name="shield" size={16} />} onPress={safety} style={styles.action} />
              <Button label="Cancel" size="small" variant="danger" icon={<Icon name="close" size={16} color={colors.status.error} />} onPress={openCancel} style={styles.action} />
            </View>
          </>
        )}

        {status === 'arrived' && driver && (
          <>
            <Text style={styles.title}>Meet {driver.firstName} at {trip.pickupName}</Text>
            {tripPin ? (
              <>
                <Text style={styles.body}>
                  Share this PIN with your driver to start the trip. Never share it before you get in.
                </Text>
                <View style={styles.pinRow}>
                  {trip.pin.split('').map((digit, i) => (
                    <View key={i} style={styles.pinCell}>
                      <Text style={styles.pinDigit}>{digit}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.body}>
                Check the plate is <Text style={styles.value}>{driver.plate}</Text> ({driver.color}) before you get in.
              </Text>
            )}
            <DriverCard driver={driver} onMessage={message} onCall={call} />
            <Button
              label={`Message ${driver.firstName}`}
              variant="secondary"
              fullWidth
              icon={<Icon name="message" size={18} />}
              onPress={message}
            />
          </>
        )}

        {status === 'onTrip' && driver && (
          <>
            <Text style={styles.title}>Arriving at {arrival}</Text>
            <Text style={styles.body}>
              {minutesLeft} min · {kmLeft} km to {trip.destinationName}
            </Text>
            <ProgressBar value={progress} />
            {sharedChip}
            <RouteSummary pickup={trip.pickupName} destination={trip.destinationName} />
            <View style={styles.actions}>
              <Button label="Share trip" size="small" variant="secondary" icon={<Icon name="share" size={16} />} onPress={shareTrip} style={styles.action} />
              <Button label={`Call ${driver.firstName}`} size="small" variant="secondary" icon={<Icon name="phone" size={16} />} onPress={call} style={styles.action} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.canvas },
  pulseWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: colors.map.rider },
  top: {
    position: 'absolute',
    left: space.xl,
    right: space.xl,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    height: 32,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.brand,
  },
  pillText: { ...type.captionStrong, color: colors.text.primary },
  sos: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    height: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.errorSubtle,
  },
  sosText: { ...type.captionStrong, color: colors.status.error },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
  headRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  plate: {
    alignItems: 'center',
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.text.primary,
  },
  plateText: { ...type.captionStrong, color: colors.text.onAccent },
  plateSub: { fontSize: 10, color: colors.text.onAccent },
  actions: { flexDirection: 'row', gap: space.sm },
  action: { flex: 1 },
  pinRow: { flexDirection: 'row', gap: space.md },
  pinCell: {
    width: 56,
    height: 64,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: { ...type.h2, color: colors.text.primary },
  summary: {
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surfaceRaised,
  },
  summaryRow: { flexDirection: 'row', gap: space.lg },
  routeLine: { alignItems: 'center', paddingVertical: 22 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.bg.accent },
  line: { width: 2, flex: 1, marginVertical: space.xs, backgroundColor: colors.border.default },
  square: { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.text.primary },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
  label: { ...type.caption, color: colors.text.secondary },
  value: { ...type.bodyStrong, color: colors.text.primary },
  accentText: { ...type.captionStrong, color: colors.text.accent },
});