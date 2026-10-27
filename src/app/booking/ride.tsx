// src/app/booking/ride.tsx — 13 Choose a ride
import { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { MapPin } from '../../components/MapPin';
import { RiderMarker } from '../../components/MapMarkers';
import { campuses } from '../../data/campuses';
import { rideTypes } from '../../data/rides';
import { useUser } from '../../store/useUser';
import { useBooking } from '../../store/useBooking';
import { parseKm, fareFor, tripMinutes } from '../../utils/fare';
import { clockIn } from '../../utils/format';
import { mockRoute } from '../../utils/route';
import { darkMapStyle } from '../../theme/mapStyle';
import { colors, space, radius, type } from '../../theme';

export default function ChooseRide() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(0);

  const campusId = useUser((s) => s.campusId);
  const email = useUser((s) => s.email);
  const pickup = useBooking((s) => s.pickup);
  const destination = useBooking((s) => s.destination);
  const rideType = useBooking((s) => s.rideType);
  const setRideType = useBooking((s) => s.setRideType);

  const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];
  const start = { latitude: campus.latitude, longitude: campus.longitude };
  const km = parseKm(destination?.distance);
  const route = mockRoute(start, km, destination?.id ?? 'none');
  const end = route[route.length - 1];
  const tripMin = tripMinutes(km);
  const isStudent = email.toLowerCase().endsWith('.edu.ng');

  const selected = rideTypes.find((r) => r.id === rideType) ?? rideTypes[0];
  const selectedPrice = fareFor(selected.id, km);

  useEffect(() => {
    if (!mapReady || !sheetHeight) return;
    mapRef.current?.fitToCoordinates(route, {
      edgePadding: { top: insets.top + 140, bottom: sheetHeight + 60, left: 80, right: 80 },
      animated: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, sheetHeight]);

  if (!destination) return null;

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...start, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        onMapReady={() => setMapReady(true)}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
        showsPointsOfInterest={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        <Polyline coordinates={route} strokeColor={colors.bg.canvas} strokeWidth={9} lineCap="round" lineJoin="round" />
        <Polyline coordinates={route} strokeColor={colors.map.route} strokeWidth={5} lineCap="round" lineJoin="round" />

        <Marker coordinate={start} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <RiderMarker />
        </Marker>

        <Marker
          coordinate={{ latitude: start.latitude + 0.0007, longitude: start.longitude - 0.0012 }}
          anchor={{ x: 1, y: 1 }}
          tracksViewChanges={false}
        >
          <View style={styles.eta}>
            <Icon name="clock" size={16} color={colors.text.onAccent} />
            <Text style={styles.etaText}>{selected.awayMin} min</Text>
          </View>
        </Marker>

        <Marker coordinate={end} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
          <View style={styles.destination}>
            <View style={styles.placeLabel}>
              <View style={styles.placeDot} />
              <Text style={styles.placeText} numberOfLines={1}>{destination.name}</Text>
            </View>
            <MapPin size={34} />
          </View>
        </Marker>
      </MapView>

      <Svg style={styles.scrim} pointerEvents="none">
        <Defs>
          <LinearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.bg.canvas} stopOpacity={0.9} />
            <Stop offset="1" stopColor={colors.bg.canvas} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#scrim)" />
      </Svg>

      <View style={[styles.top, { top: insets.top + space.sm }]}>
        <Pressable style={styles.roundButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Icon name="arrow-left" />
        </Pressable>
        <View style={styles.routePill}>
          <Text style={styles.pillText} numberOfLines={1}>{pickup.area}</Text>
          <Icon name="arrow-right" size={16} color={colors.icon.muted} />
          <Text style={[styles.pillText, { flexShrink: 1 }]} numberOfLines={1}>{destination.name}</Text>
        </View>
      </View>

      <View
        style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}
        onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.handle} />

        <View style={styles.titleRow}>
          <Text style={styles.title}>Choose a ride</Text>
          {isStudent && <Chip variant="accent" icon="school" label="Student fare" />}
        </View>

        {rideTypes.map((r) => {
          const isSelected = r.id === rideType;
          return (
            <Pressable
              key={r.id}
              onPress={() => setRideType(r.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <Image source={r.image} style={styles.vehicle} resizeMode="contain" />
              <View style={styles.details}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{r.name}</Text>
                  <View style={styles.seats}>
                    <Icon name="users" size={14} color={colors.icon.muted} />
                    <Text style={styles.meta}>{r.seats}</Text>
                  </View>
                </View>
                <Text style={styles.meta} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                  {r.awayMin} min away · Drop-off {clockIn(r.awayMin + tripMin)}
                </Text>
              </View>
              <Text style={styles.price}>₦{fareFor(r.id, km)}</Text>
            </Pressable>
          );
        })}

        <Button
          label={`Choose ${selected.name} · ₦${selectedPrice}`}
          fullWidth
          onPress={() => router.push('/booking/confirm')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.canvas },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  top: {
    position: 'absolute',
    left: space.xl,
    right: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routePill: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.canvas,
  },
  pillText: { ...type.captionStrong, color: colors.text.primary },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.accent,
  },
  etaText: { ...type.captionStrong, color: colors.text.onAccent },
  destination: { alignItems: 'center', gap: space.xs },
  placeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    maxWidth: 220,
    paddingVertical: space.sm,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.canvas,
  },
  placeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bg.accent },
  placeText: { ...type.captionStrong, color: colors.text.primary, flexShrink: 1 },
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
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...type.h2, color: colors.text.primary },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  cardSelected: {
    borderWidth: 1.5,
    borderColor: colors.border.focus,
    backgroundColor: colors.bg.surfaceRaised,
  },
  vehicle: { width: 84, height: 56 },
  details: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  name: { ...type.h3, color: colors.text.primary },
  seats: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  meta: { ...type.caption, color: colors.text.secondary },
  price: { ...type.price, color: colors.text.primary },
});