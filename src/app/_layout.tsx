// app/_layout.tsx
// The root layout wraps every screen. We load fonts here so no screen
// ever renders in the wrong typeface.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { KonkhmerSleokchher_400Regular } from '@expo-google-fonts/konkhmer-sleokchher';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync(); // keep the splash up until fonts are ready

export default function RootLayout() {
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    KonkhmerSleokchher_400Regular,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false, // every UniRide screen draws its own header
          contentStyle: { backgroundColor: colors.bg.screen },
        }}
      />
    </>
  );
}