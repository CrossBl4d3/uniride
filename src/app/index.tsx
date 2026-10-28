// src/app/index.tsx — 01 Splash
import { useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { AppIcon, Wordmark } from '../components/Brand';
import { useUser } from '../store/useUser';
import { waitForSavedData } from '../store/session';
import { colors, space, type } from '../theme';

export default function Splash() {
  const { width } = useWindowDimensions();

  useEffect(() => {
    let cancelled = false;
    const minimumShow = new Promise((resolve) => setTimeout(resolve, 1500));

    // Wait for BOTH: the splash to show for 1.5s, and saved data to load.
    Promise.all([minimumShow, waitForSavedData()]).then(() => {
      if (cancelled) return;
      router.replace(useUser.getState().signedIn ? '/home' : '/welcome');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.glowLayer} pointerEvents="none">
        <Svg width={width} height={width}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.bg.brand} stopOpacity={0.9} />
              <Stop offset="1" stopColor={colors.bg.brand} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={width / 2} cy={width / 2} r={width / 2} fill="url(#glow)" />
        </Svg>
      </View>

      <View style={styles.lockup}>
        <AppIcon />
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
  glowLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: { alignItems: 'center', gap: space.sm },
  tagline: { ...type.body, color: colors.text.secondary },
});