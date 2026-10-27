// src/app/(tabs)/home.tsx — 09 Home (the sheet grows into 10 Plan route)
import { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Alert, Animated, Easing, BackHandler, Keyboard, useWindowDimensions,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Chip } from '../../components/Chip';
import { ListRow } from '../../components/ListRow';
import { RiderMarker, VehicleMarker } from '../../components/MapMarkers';
import { PlanRoutePanel } from '../../components/PlanRoutePanel';
import { useTabBarHeight } from '../../components/TabBar';
import { campuses } from '../../data/campuses';
import { recentPlaces, savedPlaces, Place } from '../../data/places';
import { useUser } from '../../store/useUser';
import { useBooking } from '../../store/useBooking';
import { useUI } from '../../store/useUI';
import { darkMapStyle } from '../../theme/mapStyle';
import { colors, space, radius, type } from '../../theme';

const DURATION = 320; // ms, same as the tab bar so they move together

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const tabBarHeight = useTabBarHeight();

  const firstName = useUser((s) => s.firstName);
  const campusId = useUser((s) => s.campusId);
  const setDestination = useBooking((s) => s.setDestination);
  const expanded = useUI((s) => s.sheetExpanded);
  const setExpanded = useUI((s) => s.setSheetExpanded);

  const mapRef = useRef<MapView>(null);
  const [collapsedHeight, setCollapsedHeight] = useState(420);
  const [showPanel, setShowPanel] = useState(false);
  const [prefill, setPrefill] = useState('');

  // 0 = sheet collapsed, 1 = sheet covering the whole screen
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!expanded) Keyboard.dismiss(); // close the keyboard as the sheet starts to shrink
    if (expanded) setShowPanel(true);  // mount Plan route as we start growing
    Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !expanded) setShowPanel(false); // unmount once fully collapsed
    });
  }, [expanded, progress]);

  // Android back button: collapse the sheet instead of leaving Home.
  useEffect(() => {
    if (!expanded) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setExpanded(false);
      return true;
    });
    return () => sub.remove();
  }, [expanded, setExpanded]);

  // If Home ever unmounts while expanded, make sure the tab bar comes back.
  useEffect(() => () => setExpanded(false), [setExpanded]);

  const openPlanner = (place?: Place) => {
    if (place) setDestination(place);
    setPrefill(place?.name ?? '');
    setExpanded(true);
  };

  const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];
  const { latitude, longitude } = campus;
  const region: Region = { latitude: latitude - 0.004, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
  const vehicles = [
    { id: 'k1', latitude: latitude + 0.0012, longitude: longitude + 0.0018 },
    { id: 'k2', latitude: latitude - 0.002, longitude: longitude - 0.0005 },
    { id: 'k3', latitude: latitude - 0.0016, longitude: longitude - 0.0035 },
  ];

  // Everything the animation drives, all derived from `progress`
  const sheetY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight - collapsedHeight, 0],
  });
  const homeContentOpacity = progress.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' });
  const panelOpacity = progress.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        key={campus.id}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
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

      {/* Fades in behind the growing sheet so its rounded corners never show the map */}
      <Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: progress }]} />

      {/* The sheet is always full-screen height; we slide it so only its top shows */}
      <Animated.View style={[styles.sheet, { height: screenHeight, transform: [{ translateY: sheetY }] }]}>
        <Animated.View
          onLayout={(e) => setCollapsedHeight(e.nativeEvent.layout.height)}
          pointerEvents={expanded ? 'none' : 'auto'}
          style={[styles.collapsed, { paddingBottom: tabBarHeight + space.lg, opacity: homeContentOpacity }]}
        >
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Where are you going?</Text>

          <Pressable style={styles.fakeField} onPress={() => openPlanner()}>
            <Icon name="search" color={colors.icon.muted} />
            <Text style={styles.placeholder}>Search destination</Text>
            <Icon name="clock" color={colors.icon.muted} />
          </Pressable>

          <View style={styles.chips}>
            {savedPlaces.map((s) => (
              <Pressable key={s.label} onPress={() => openPlanner(s.place)}>
                <Chip icon={s.icon} label={s.label} />
              </Pressable>
            ))}
            <Pressable onPress={() => Alert.alert('Add place', 'Saving places comes later.')}>
              <Chip icon="plus" label="Add place" />
            </Pressable>
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
                onPress={() => openPlanner(p)}
              />
            ))}
          </View>
        </Animated.View>

        {showPanel && (
          <Animated.View style={[styles.panel, { opacity: panelOpacity }]}>
            <PlanRoutePanel initialQuery={prefill} onClose={() => setExpanded(false)} />
          </Animated.View>
        )}
      </Animated.View>
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
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg.screen,
  },
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  collapsed: { paddingHorizontal: space.xl, gap: space.lg },
  panel: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
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