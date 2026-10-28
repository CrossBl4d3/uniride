// src/app/sos.tsx — 36 Emergency SOS
import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { MapPin } from '../components/MapPin';
import { RiderMarker, VehicleMarker } from '../components/MapMarkers';
import { campuses } from '../data/campuses';
import { useTrip } from '../store/useTrip';
import { useSafety } from '../store/useSafety';
import { useUser } from '../store/useUser';
import { pointAlong } from '../utils/route';
import { darkMapStyle } from '../theme/mapStyle';
import { colors, space, radius, type } from '../theme';

// ["Mum"] → "Mum", ["Mum", "Ade"] → "Mum and Ade", ["A", "B", "C"] → "A, B and C"
const joinNames = (names: string[]) =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

export default function EmergencySOS() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const trip = useTrip();
  const contacts = useSafety((s) => s.contacts);
  const campusId = useUser((s) => s.campusId);

  // Is there a live trip to show? (SOS can also be opened from the Safety toolkit, with no trip.)
  const live = (trip.status === 'arriving' || trip.status === 'arrived' || trip.status === 'onTrip') && trip.route.length > 0;
  const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];
  const here = live ? trip.route[0] : { latitude: campus.latitude, longitude: campus.longitude };
  const path = trip.status === 'onTrip' ? trip.route : trip.status === 'arriving' ? trip.approach : [];
  const vehicle =
    trip.status === 'onTrip' ? pointAlong(trip.route, trip.progress)
    : trip.status === 'arriving' ? pointAlong(trip.approach, trip.progress)
    : trip.status === 'arrived' ? trip.route[0]
    : null;

  const names = contacts.map((c) => c.name.split(' ')[0]); // "Ade (roommate)" → "Ade"
  const sharedLine = names.length
    ? `Live location shared with ${joinNames(names)}`
    : 'No trusted contacts yet. Add them in Safety toolkit.';

  // Demo only. A test build must never be able to dial a real emergency line.
  const demoCall = (who: string) =>
    Alert.alert(
      `Calling ${who} (demo)`,
      'In the real app this places the call and sends your trip details, driver and plate number. Test builds never dial real emergency numbers.'
    );

  const frameMap = () => {
    if (path.length) {
      mapRef.current?.fitToCoordinates(path, {
        edgePadding: { top: insets.top + 60, bottom: (sheetHeight || 380) + 40, left: 60, right: 60 },
        animated: false,
      });
    } else {
      mapRef.current?.animateToRegion(
        { latitude: here.latitude - 0.003, longitude: here.longitude, latitudeDelta: 0.012, longitudeDelta: 0.012 },
        0
      );
    }
  };

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...here, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
        onMapReady={frameMap}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
        showsPointsOfInterest={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {path.length > 0 && (
          <>
            <Polyline coordinates={path} strokeColor={colors.bg.canvas} strokeWidth={9} lineCap="round" lineJoin="round" />
            <Polyline coordinates={path} strokeColor={colors.map.route} strokeWidth={5} lineCap="round" lineJoin="round" />
          </>
        )}
        {trip.status === 'onTrip' && (
          <Marker coordinate={trip.route[trip.route.length - 1]} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
            <MapPin size={30} />
          </Marker>
        )}
        {trip.status !== 'onTrip' && (
          <Marker coordinate={here} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <RiderMarker />
          </Marker>
        )}
        {vehicle && (
          <Marker coordinate={vehicle} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <VehicleMarker />
          </Marker>
        )}
      </MapView>

      <View
        style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}
        onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.handle} />

        <View style={styles.titleRow}>
          <View style={styles.sosIcon}>
            <Icon name="sos" size={26} color={colors.status.error} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Emergency help</Text>
            <Text style={[styles.shared, !names.length && { color: colors.status.warning }]}>{sharedLine}</Text>
          </View>
        </View>

        <Text style={styles.body}>
          Stay on the line if you can. Your trip details, driver and plate number are sent with every call.
        </Text>

        <Button
          label="Call campus security"
          variant="danger"
          fullWidth
          icon={<Icon name="phone" size={18} color={colors.status.error} />}
          onPress={() => demoCall('campus security')}
        />
        <Button
          label="Call emergency services (112)"
          variant="secondary"
          fullWidth
          icon={<Icon name="phone" size={18} />}
          onPress={() => demoCall('emergency services')}
        />
        <Button label="I’m safe — close" variant="ghost" fullWidth onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.canvas },
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm },
  sosIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bg.errorSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.h2, color: colors.text.primary },
  shared: { ...type.captionStrong, color: colors.text.accent },
  body: { ...type.body, color: colors.text.secondary },
});