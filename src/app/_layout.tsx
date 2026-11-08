// src/app/_layout.tsx
import { View, StyleSheet } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { KonkhmerSleokchher_400Regular } from '@expo-google-fonts/konkhmer-sleokchher';
import { OfflineScreen } from '../components/OfflineScreen';
import { LiveTripBanner } from '../components/LiveTripBanner';
import { useTrip } from '../store/useTrip';
import { colors, space } from '../theme';

SplashScreen.preventAutoHideAsync();

const slideUp = {
  animation: 'slide_from_bottom',
  gestureEnabled: true,
  gestureDirection: 'vertical',
} as const;

// Show the banner whenever a trip exists, except where it would be pointless:
// on the trip screens themselves, while booking, and during onboarding.
function useBannerVisible() {
  const status = useTrip((s) => s.status);
  const pathname = usePathname();
  const hiddenHere =
    pathname === '/' ||
    ['/welcome', '/sign-in', '/trip', '/booking', '/sos', '/location'].some((p) => pathname.startsWith(p));
  return status !== 'idle' && !hiddenHere;
}

// The app itself, once fonts are loaded. (Hooks must run on every render,
// so they live here rather than after RootLayout's early "return null".)
function AppShell() {
  const insets = useSafeAreaInsets();
  const showBanner = useBannerVisible();

  return (
    <View style={styles.app}>
      <StatusBar style="light" />

      {showBanner && (
        <View style={[styles.bannerStrip, { paddingTop: insets.top + space.sm }]}>
          <LiveTripBanner />
        </View>
      )}

      {/* The banner already covers the notch. So we tell every screen below it that
          the top safe-area inset is 0, otherwise they'd add notch space a second time. */}
      <SafeAreaInsetsContext.Provider value={showBanner ? { ...insets, top: 0 } : insets}>
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

          <Stack.Screen name="sos" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        </Stack>
      </SafeAreaInsetsContext.Provider>

      <OfflineScreen />
    </View>
  );
}

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
  return <AppShell />;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.bg.screen },
  bannerStrip: {
    paddingHorizontal: space.xl,
    paddingBottom: space.sm,
    backgroundColor: colors.bg.canvas,
  },
});