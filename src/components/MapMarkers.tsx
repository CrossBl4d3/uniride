// src/components/MapMarkers.tsx
// The rider dot and Keke markers from the Figma "Map/..." components.
import { View, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../theme';

// Blue dot with a soft halo: "you are here".
export function RiderMarker() {
  return (
    <View style={styles.rider}>
      <View style={styles.halo} />
      <View style={styles.dot} />
    </View>
  );
}

// Dark circle, green ring, keke icon: a nearby driver.
export function VehicleMarker() {
  return (
    <View style={styles.vehicle}>
      <Icon name="keke" size={22} color={colors.icon.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  rider: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.map.rider,
    opacity: 0.2,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.map.rider,
    borderWidth: 3,
    borderColor: colors.text.primary,
  },
  vehicle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.canvas,
    borderWidth: 2,
    borderColor: colors.border.focus,
    alignItems: 'center',
    justifyContent: 'center',
    // shadow (iOS) / elevation (Android) — the two platforms do shadows differently
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});