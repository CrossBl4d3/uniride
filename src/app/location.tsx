// src/app/location.tsx — 08 Allow location
import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { MapPin } from '../components/MapPin';
import { colors, space, type } from '../theme';

// Three circles, biggest first. Each is the accent green at a low opacity,
// so where they overlap in the middle the green gets stronger.
const rings = [
  { size: 280, opacity: 0.06 },
  { size: 200, opacity: 0.08 },
  { size: 128, opacity: 0.12 },
];

export default function AllowLocation() {
  const insets = useSafeAreaInsets();
  const [asking, setAsking] = useState(false);

  const finishOnboarding = () => {
    // Stage 4 replaces this with: router.replace('/home')
    Alert.alert('You’re all set!', 'Home and booking come in Stage 4.');
  };

  const allow = async () => {
    setAsking(true);
    // Shows the phone's own "Allow location?" popup and waits for the answer.
    const { status } = await Location.requestForegroundPermissionsAsync();
    setAsking(false);

    if (status !== 'granted') {
      // Never trap people: explain, then let them carry on anyway.
      Alert.alert(
        'Location is off',
        'You can still book by typing your pickup point. Turn location on any time in Settings.',
        [{ text: 'OK', onPress: finishOnboarding }]
      );
      return;
    }
    finishOnboarding();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}>
      <View style={styles.illustration}>
        {rings.map((r) => (
          <View
            key={r.size}
            style={[
              styles.ring,
              { width: r.size, height: r.size, borderRadius: r.size / 2, opacity: r.opacity },
            ]}
          />
        ))}
        <MapPin size={54} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Allow location access</Text>
        <Text style={styles.body}>
          UniRide uses your location to find Kekes near you and set your pickup point. Location is
          only shared with your driver during a trip.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Allow while using the app"
          fullWidth
          loading={asking}
          icon={<Icon name="navigation" size={18} color={colors.text.onAccent} />}
          onPress={allow}
        />
        <Button label="Not now" variant="ghost" fullWidth onPress={finishOnboarding} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  illustration: {
    height: 280,
    marginTop: 116,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: { position: 'absolute', backgroundColor: colors.bg.accent }, // stacked on top of each other
  content: { paddingHorizontal: space.xl, marginTop: space['4xl'], gap: space.md },
  title: { ...type.h1, color: colors.text.primary, textAlign: 'center' },
  body: { ...type.body, color: colors.text.secondary, textAlign: 'center' },
  actions: { marginTop: 'auto', paddingHorizontal: space.xl, gap: space.sm },
});