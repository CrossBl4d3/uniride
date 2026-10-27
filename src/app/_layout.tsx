// src/app/_layout.tsx
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

SplashScreen.preventAutoHideAsync();

// Screens with a × close button slide up from the bottom; swipe down to dismiss (iPhone).
const slideUp = {
  animation: 'slide_from_bottom',
  gestureEnabled: true,
  gestureDirection: 'vertical',
} as const;

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
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.screen },
        }}
      >
        <Stack.Screen name="campus" options={slideUp} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        {/* A live trip can't be swiped away: you cancel or finish it. */}
        <Stack.Screen name="trip/index" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="trip/found" options={{ gestureEnabled: false, animation: 'fade' }} />
      </Stack>
    </>
  );
}