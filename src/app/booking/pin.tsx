// src/app/booking/pin.tsx — 12 Set destination on map
// Two jobs: purpose "book" (default) sets your drop-off; purpose "save" picks a place to save.
import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { MapPin } from '../../components/MapPin';
import { RiderMarker } from '../../components/MapMarkers';
import { campuses } from '../../data/campuses';
import { Place } from '../../data/places';
import { useUser } from '../../store/useUser';
import { useBooking } from '../../store/useBooking';
import { useUI } from '../../store/useUI';
import { placeAt } from '../../utils/geocode';
import { LatLng } from '../../utils/route';
import { darkMapStyle } from '../../theme/mapStyle';
import { colors, space, radius, type } from '../../theme';

const PIN_SIZE = 44;
const PIN_HEIGHT = PIN_SIZE * (74 / 54);

export default function SetOnMap() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { purpose } = useLocalSearchParams<{ purpose?: 'book' | 'save' }>();
  const saving = purpose === 'save';

  const campusId = useUser((s) => s.campusId);
  const setDestination = useBooking((s) => s.setDestination);
  const setPickedPlace = useUI((s) => s.setPickedPlace);

  const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];
  const start: LatLng = { latitude: campus.latitude, longitude: campus.longitude };
  const initial: Region = { ...start, latitudeDelta: 0.008, longitudeDelta: 0.008 };

  const [moving, setMoving] = useState(false);
  const [looking, setLooking] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);

  const movingRef = useRef(false);
  const lookupId = useRef(0);
  const lift = useRef(new Animated.Value(0)).current;

  const animateLift = (to: number) =>
    Animated.spring(lift, { toValue: to, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  const onMoveStart = () => {
    if (movingRef.current) return;
    movingRef.current = true;
    setMoving(true);
    animateLift(1);
  };

  const onMoveEnd = (region: Region) => {
    movingRef.current = false;
    setMoving(false);
    animateLift(0);
    lookUp({ latitude: region.latitude, longitude: region.longitude });
  };

  const lookUp = async (point: LatLng) => {
    const myId = ++lookupId.current;
    setLooking(true);
    const found = await placeAt(point, start);
    if (myId !== lookupId.current) return; // a newer lookup has started: ignore this one
    setPlace(found);
    setLooking(false);
  };

  const confirm = () => {
    if (!place) return;
    if (saving) {
      setPickedPlace(place); // Add a place picks this up when we go back
      router.back();
      return;
    }
    setDestination(place);
    router.replace('/booking/ride');
  };

  const pinY = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const shadowScale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });
  const busy = moving || looking;

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initial}
        onMapReady={() => mapRef.current?.animateToRegion(initial, 0)}
        onRegionChange={onMoveStart}
        onRegionChangeComplete={onMoveEnd}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
        showsPointsOfInterest={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        <Marker coordinate={start} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <RiderMarker />
        </Marker>
      </MapView>

      <View style={styles.pinLayer} pointerEvents="none">
        <Animated.View style={[styles.pinShadow, { transform: [{ scale: shadowScale }] }]} />
        <Animated.View style={{ position: 'absolute', transform: [{ translateY: -PIN_HEIGHT / 2 }, { translateY: pinY }] }}>
          <MapPin size={PIN_SIZE} />
        </Animated.View>
      </View>

      <View style={[styles.top, { top: insets.top + space.sm }]}>
        <Pressable style={styles.roundButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Icon name="arrow-left" />
        </Pressable>
        <View style={styles.hint}>
          <View style={styles.hintDot} />
          <Text style={styles.hintText}>
            {saving ? 'Move the map to choose a place' : 'Move the map to set your drop-off'}
          </Text>
        </View>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.handle} />
        <Text style={styles.overline}>{saving ? 'Place' : 'Drop-off'}</Text>

        <View style={styles.placeRow}>
          <View style={{ flex: 1, gap: 2 }}>
            {busy || !place ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.text.accent} />
                <Text style={styles.area}>{moving ? 'Moving…' : 'Finding the address…'}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                <Text style={styles.area} numberOfLines={1}>{place.area}</Text>
              </>
            )}
          </View>
          <Pressable style={styles.searchButton} onPress={() => router.back()} accessibilityLabel="Search instead">
            <Icon name="search" size={20} />
          </Pressable>
        </View>

        <Button
          label={saving ? 'Use this place' : 'Confirm destination'}
          fullWidth
          disabled={busy || !place}
          onPress={confirm}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.canvas },
  pinLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShadow: { width: 14, height: 6, borderRadius: 7, backgroundColor: 'rgba(0,0,0,0.45)' },
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
  hint: {
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
  hintDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bg.accent },
  hintText: { ...type.captionStrong, color: colors.text.primary, flexShrink: 1 },
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
  overline: { ...type.overline, color: colors.text.tertiary },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  placeName: { ...type.h3, color: colors.text.primary },
  area: { ...type.caption, color: colors.text.secondary },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});