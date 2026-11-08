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
import { TripMorph } from '../components/TripMorph';
import { useTrip } from '../store/useTrip';
import { useMorph } from '../store/useMorph';
import { colors, space } from '../theme';

SplashScreen.preventAutoHideAsync();

const slideUp = {
  animation: 'slide_from_bottom',
  gestureEnabled: true,
  gestureDirection: 'vertical',
} as const;

function useBannerVisible() {
  const status = useTrip((s) => s.status);
  const pathname = usePathname();
  const hiddenHere =
    pathname === '/' ||
    ['/welcome', '/sign-in', '/trip', '/booking', '/sos', '/location'].some((p) => pathname.startsWith(p));
  return status !== 'idle' && !hiddenHere;
}

function AppShell() {
  const insets = useSafeAreaInsets();
  const showBanner = useBannerVisible();
  const setBannerRect = useMorph((s) => s.setBannerRect);

  return (
    <View style={styles.app}>
      <StatusBar style="light" />

      {showBanner && (
        <View style={[styles.bannerStrip, { paddingTop: insets.top + space.sm }]}>
          {/* Report exactly where the banner is drawn, so the morph can start and end there */}
          <View
            onLayout={(e) => {
              const { x, y, width, height } = e.nativeEvent.layout;
              setBannerRect({ x, y, width, height });
            }}
          >
            <LiveTripBanner />
          </View>
        </View>
      )}

      <SafeAreaInsetsContext.Provider value={showBanner ? { ...insets, top: 0 } : insets}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg.screen },
          }}
        >
          <Stack.Screen name="campus" options={slideUp} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />

          {/* Opened by the morph card? Then no slide of its own (the card does the animating). */}
          <Stack.Screen
            name="trip/index"
            options={({ route }) => ({
              gestureEnabled: false,
              animation: (route.params as { morph?: string } | undefined)?.morph ? 'none' : 'slide_from_bottom',
            })}
          />
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

      {/* Above every screen, below the offline overlay */}
      <TripMorph />
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