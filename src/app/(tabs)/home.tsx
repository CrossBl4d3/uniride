// src/app/(tabs)/home.tsx — 09 Home
import { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Chip } from '../../components/Chip';
import { ListRow } from '../../components/ListRow';
import { RiderMarker, VehicleMarker } from '../../components/MapMarkers';
import { campuses } from '../../data/campuses';
import { recentPlaces } from '../../data/places';
import { useUser } from '../../store/useUser';
import { darkMapStyle } from '../../theme/mapStyle';
import { colors, space, radius, type } from '../../theme';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const firstName = useUser((s) => s.firstName);
  const campusId = useUser((s) => s.campusId);
  const mapRef = useRef<MapView>(null); // a handle to the real map, so we can move its camera

  const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];
  const { latitude, longitude } = campus;

  // The area we want on screen: about 2km of campus, centre nudged down
  // so the rider dot sits above the sheet.
  const region: Region = {
    latitude: latitude - 0.004,
    longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const vehicles = [
    { id: 'k1', latitude: latitude + 0.0012, longitude: longitude + 0.0018 },
    { id: 'k2', latitude: latitude - 0.002, longitude: longitude - 0.0005 },
    { id: 'k3', latitude: latitude - 0.0016, longitude: longitude - 0.0035 },
  ];

  const comingNext = () => router.push('/booking/plan');

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        key={campus.id}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        // initialRegion can be ignored on iPhone, so once the map is ready we
        // move the camera there ourselves (0 = jump instantly, no animation).
        onMapReady={() => mapRef.current?.animateToRegion(region, 0)}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
        showsPointsOfInterest={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <RiderMarker />
        </Marker>
        {vehicles.map((v) => (
          <Marker key={v.id} coordinate={v} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <VehicleMarker />
          </Marker>
        ))}
      </MapView>

      <Svg style={styles.scrim} pointerEvents="none">
        <Defs>
          <LinearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.bg.canvas} stopOpacity={0.95} />
            <Stop offset="1" stopColor={colors.bg.canvas} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#scrim)" />
      </Svg>

      <View style={[styles.header, { top: insets.top + space.sm }]}>
        <View style={styles.greeting}>
          <Text style={styles.hello} numberOfLines={1}>
            {greeting()}, {firstName || 'there'}
          </Text>
          <Pressable style={styles.campus} onPress={() => router.push('/campus')} hitSlop={8}>
            <Icon name="school" size={16} color={colors.icon.accent} />
            <Text style={styles.campusName}>{campus.name}</Text>
            <Icon name="chevron-down" size={14} color={colors.icon.accent} />
          </Pressable>
        </View>
        <Pressable style={styles.roundButton} onPress={() => Alert.alert('Notifications', 'Coming in Stage 7.')}>
          <Icon name="bell" />
        </Pressable>
      </View>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>Where are you going?</Text>

        <Pressable style={styles.fakeField} onPress={comingNext}>
          <Icon name="search" color={colors.icon.muted} />
          <Text style={styles.placeholder}>Search destination</Text>
          <Icon name="clock" color={colors.icon.muted} />
        </Pressable>

        <View style={styles.chips}>
          <Pressable onPress={comingNext}><Chip icon="home" label="Hall" /></Pressable>
          <Pressable onPress={comingNext}><Chip icon="school" label="Faculty" /></Pressable>
          <Pressable onPress={comingNext}><Chip icon="plus" label="Add place" /></Pressable>
        </View>

        <View>
          {recentPlaces.slice(0, 2).map((p, i) => (
            <ListRow
              key={p.id}
              icon="clock"
              title={p.name}
              subtitle={p.area}
              trailingText={p.distance}
              divider={i === 0}
              onPress={comingNext}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.canvas },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 240 },
  header: {
    position: 'absolute',
    left: space.xl,
    right: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  greeting: { flex: 1 },
  hello: { ...type.h2, color: colors.text.primary },
  campus: { flexDirection: 'row', alignItems: 'center', gap: space.xs, alignSelf: 'flex-start' },
  campusName: { ...type.captionStrong, color: colors.text.accent },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.xl,
    paddingBottom: space.lg,
    gap: space.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    marginTop: space.sm,
    backgroundColor: colors.border.strong,
  },
  sheetTitle: { ...type.h3, color: colors.text.primary },
  fakeField: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surfaceRaised,
  },
  placeholder: { ...type.bodyLarge, flex: 1, color: colors.text.tertiary },
  chips: { flexDirection: 'row', gap: space.sm },
});