// src/app/index.tsx — 01 Splash
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LogoMark, Wordmark } from '../components/Brand';
import { useUser } from '../store/useUser';
import { useTrip } from '../store/useTrip';
import { waitForSavedData } from '../store/session';
import { colors, space, type } from '../theme';

export default function Splash() {
  useEffect(() => {
    let cancelled = false;
    const minimumShow = new Promise((resolve) => setTimeout(resolve, 1500));

    Promise.all([minimumShow, waitForSavedData()]).then(() => {
      if (cancelled) return;
      useTrip.getState().resume(); // a ride that was live before the restart carries on
      router.replace(useUser.getState().signedIn ? '/home' : '/welcome');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.lockup}>
        <LogoMark width={132} />
        <Wordmark />
        <Text style={styles.tagline}>Campus rides, sorted.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: { alignItems: 'center', gap: space.lg },
  tagline: { ...type.body, color: colors.text.secondary, marginTop: -space.sm },
});