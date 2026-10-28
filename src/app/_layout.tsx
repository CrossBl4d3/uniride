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

        <Stack.Screen name="trip/index" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="trip/found" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="trip/rate" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="trip/no-drivers" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen
          name="trip/cancel"
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            gestureEnabled: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />

        {/* Emergency: slides up, can't be swiped away by accident. Close with "I'm safe". */}
        <Stack.Screen name="sos" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
      </Stack>
    </>
  );
}