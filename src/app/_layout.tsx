// src/app/_layout.tsx
import { View, StyleSheet } from 'react-native';
import { Stack, usePathname, ThemeProvider, DarkTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
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
import { DeviceInsetsContext } from '../hooks/useDeviceInsets';
import { useTrip } from '../store/useTrip';
import { useMorph } from '../store/useMorph';
import { colors, space } from '../theme';

SplashScreen.preventAutoHideAsync();
// The colour behind every screen. Without this, gaps during transitions flash white.
SystemUI.setBackgroundColorAsync(colors.bg.canvas);

// Every navigator background is dark too (no white scene behind the tabs).
const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.bg.accent,
    background: colors.bg.canvas,
    card: colors.bg.screen,
    text: colors.text.primary,
    border: colors.border.hairline,
  },
};

const slideUp = {
  animation: 'slide_from_bottom',
  gestureEnabled: true,
  gestureDirection: 'vertical',
} as const;

// Trip screens float over the previous screen (so Home stays visible while they grow out of
// the banner) and do their own animating, so the stack must not animate them.
const morphScreen = {
  presentation: 'transparentModal',
  animation: 'none',
  gestureEnabled: false,
  contentStyle: { backgroundColor: 'transparent' },
} as const;

// On iPhone, a normal screen pushed on top of a transparent trip screen would end up
// BEHIND it (or as a half-height sheet). So anything opened from a trip screen (chat,
// safety, SOS) is shown full screen on top instead.
type ScreenArgs = { route: { key: string }; navigation: { getState: () => { routes: { key: string; name: string }[] } | undefined } };
function aboveTripScreen({ route, navigation }: ScreenArgs) {
  const routes = navigation.getState()?.routes ?? [];
  const tripAt = routes.findIndex((r) => r.name.startsWith('trip/'));
  const at = routes.findIndex((r) => r.key === route.key);
  return tripAt !== -1 && at > tripAt;
}

// Screens that never show the banner.
const NO_BANNER = ['/welcome', '/sign-in', '/trip', '/booking', '/sos', '/location'];
// Trip screens that float over a banner screen.
const MORPH_PATHS = ['/trip', '/trip/rate', '/trip/no-drivers'];

function AppShell() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const status = useTrip((s) => s.status);
  const keepBanner = useMorph((s) => s.keepBanner);
  const underBanner = useMorph((s) => s.underBanner);
  const stripHeight = useMorph((s) => s.stripHeight);
  const setStripHeight = useMorph((s) => s.setStripHeight);
  const setBannerRect = useMorph((s) => s.setBannerRect);

  const live = status !== 'idle';
  const noBannerHere = pathname === '/' || NO_BANNER.some((p) => pathname.startsWith(p));

  // DRAW the banner?
  const showBanner = live && (!noBannerHere || keepBanner);

  // Make room for it? The banner floats over the screens, so screens that show it get a
  // bigger top inset. A trip screen floating over Home keeps Home's room, so Home never
  // jumps while the trip screen grows or shrinks.
  const makeRoom = live && (!noBannerHere || (MORPH_PATHS.includes(pathname) && underBanner));
  const bannerTop = stripHeight || insets.top + space.sm * 2 + 68;
  const screenInsets = makeRoom ? { ...insets, top: bannerTop } : insets;

  return (
    <View style={styles.app}>
      <StatusBar style="light" />

      <DeviceInsetsContext.Provider value={insets}>
        <SafeAreaInsetsContext.Provider value={screenInsets}>
          <ThemeProvider value={navTheme}>
            <Stack
              screenOptions={(args) => ({
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg.screen },
                ...(aboveTripScreen(args as unknown as ScreenArgs) && { presentation: 'fullScreenModal' as const }),
              })}
            >
              <Stack.Screen name="campus" options={slideUp} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />

              <Stack.Screen name="trip/index" options={morphScreen} />
              <Stack.Screen name="trip/rate" options={morphScreen} />
              <Stack.Screen name="trip/no-drivers" options={morphScreen} />
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
          </ThemeProvider>
        </SafeAreaInsetsContext.Provider>
      </DeviceInsetsContext.Provider>

      {/* The banner floats above every screen, at the very top */}
      {showBanner && (
        <View
          style={[styles.bannerStrip, { paddingTop: insets.top + space.sm }]}
          onLayout={(e) => setStripHeight(e.nativeEvent.layout.height)}
        >
          {/* The strip sits at the top-left of the window, so these are window coordinates */}
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
  app: { flex: 1, backgroundColor: colors.bg.canvas },
  bannerStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: space.xl,
    paddingBottom: space.sm,
    backgroundColor: colors.bg.canvas,
  },
});