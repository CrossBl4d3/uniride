// src/components/MorphScreen.tsx
// Wraps a full-screen trip screen so it can GROW out of the live-trip banner (or the Pay button)
// and SHRINK back into the banner.
//
// How it works: the real screen is drawn at full size, but inside a "window" (a clipping
// rectangle). The window starts exactly where the banner is and grows to fill the phone, so
// it looks like the banner itself is stretching into the tracking screen. Minimising runs it
// backwards. The screen behind (Home) stays visible because trip screens are transparent modals.
//
// The animation runs on the UI thread (Reanimated), so it stays smooth even while the
// JavaScript thread is busy loading the map.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { router, useFocusEffect, useNavigation, useRoute } from 'expo-router';
import { CommonActions } from 'expo-router/react-navigation';
import { LiveTripBanner } from './LiveTripBanner';
import { useMorph, Origin } from '../store/useMorph';
import { useDeviceInsets } from '../hooks/useDeviceInsets';
import { colors, space } from '../theme';

const OPEN_MS = 420;
const CLOSE_MS = 380;
const FADE_MS = 220;
const BANNER_RADIUS = 20;
const ease = Easing.bezier(0.2, 0, 0, 1); // fast start, gentle landing

type MorphControls = {
  ready: boolean;   // finished appearing: safe to navigate onwards
  closing: boolean; // shrinking away: don't navigate anywhere else
  close: (then?: () => void) => void;   // shrink into the banner, then leave
  fadeOut: (then: () => void) => void;  // fade away (when the ride is over and there's no banner)
};

const MorphContext = createContext<MorphControls>({
  ready: true,
  closing: false,
  close: (then) => then?.(),
  fadeOut: (then) => then(),
});

export const useMorphScreen = () => useContext(MorphContext);

const leaveTrip = () => {
  if (router.canGoBack()) router.back();
  else router.replace('/home');
};

export function MorphScreen({ children }: { children: ReactNode }) {
  const device = useDeviceInsets();
  const dims = useWindowDimensions();
  const navigation = useNavigation();
  const route = useRoute();

  // Read once, as the screen first appears.
  const [origin] = useState<Origin | null>(() => useMorph.getState().pending);
  const [ready, setReady] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showBannerCopy, setShowBannerCopy] = useState(!!origin?.fromBanner);
  const [showGhostStrip, setShowGhostStrip] = useState(!!origin?.fromBanner);
  const closingRef = useRef(false);

  // The window's start rectangle, the screen size, and the animation progress.
  const fx = useSharedValue(origin?.rect.x ?? 0);
  const fy = useSharedValue(origin?.rect.y ?? 0);
  const fw = useSharedValue(origin?.rect.width ?? dims.width);
  const fh = useSharedValue(origin?.rect.height ?? dims.height);
  const fr = useSharedValue(origin?.radius ?? 0);
  const sw = useSharedValue(dims.width);
  const sh = useSharedValue(dims.height);
  const p = useSharedValue(origin ? 0 : 1); // 0 = small (banner), 1 = full screen
  const fade = useSharedValue(origin ? 1 : 0);

  // Once the TRACKING screen is open, remove booking screens (and any older trip screen)
  // hiding behind it, so "back" and "minimise" land on Home. Keys are kept, so nothing reloads.
  // (The rating / no-drivers screens leave the tracking screen underneath them alone.)
  const dropScreensBehind = useCallback(() => {
    if (route.name !== 'trip/index') return;
    const state = navigation.getState();
    if (!state) return;
    const routes = state.routes.filter(
      (r) => r.key === route.key || !(r.name.startsWith('booking/') || r.name.startsWith('trip/'))
    );
    if (routes.length === state.routes.length) return; // nothing to remove
    navigation.dispatch(CommonActions.reset({ ...state, routes, index: routes.length - 1 }));
  }, [navigation, route.key, route.name]);

  const finishOpen = useCallback(() => {
    setShowBannerCopy(false);
    setShowGhostStrip(false);
    setReady(true);
    dropScreensBehind();
    useMorph.getState().finishOpen();
  }, [dropScreensBehind]);

  // ---- Appear ----
  useEffect(() => {
    useMorph.getState().takeOrigin(); // clear it so the next screen doesn't reuse it

    if (!origin) {
      // Opened without a starting point (e.g. the rating screen over tracking): quick fade in.
      fade.set(withTiming(1, { duration: FADE_MS }, (done) => {
        if (done) runOnJS(finishOpen)();
      }));
      return;
    }

    // Wait one frame so this screen is really on the glass, then let the real banner go
    // (our copy sits exactly on top of it) and grow.
    const frame = requestAnimationFrame(() => {
      useMorph.getState().setKeepBanner(false);
      p.set(withTiming(1, { duration: OPEN_MS, easing: ease }, (done) => {
        if (done) runOnJS(finishOpen)();
      }));
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // What to do once a close/fade finishes (kept here so the UI thread only has to say "done").
  const afterRef = useRef<() => void>(leaveTrip);

  // ---- Shrink back into the banner ----
  const finishClose = useCallback(() => {
    // Draw the real banner (identical to our copy, same spot), then leave instantly underneath it.
    useMorph.getState().setKeepBanner(true);
    afterRef.current();
    setTimeout(() => useMorph.getState().setKeepBanner(false), 300);
  }, []);

  const finishFade = useCallback(() => afterRef.current(), []);

  const close = useCallback(
    (then: () => void = leaveTrip) => {
      if (closingRef.current) return;
      closingRef.current = true;
      afterRef.current = then;
      setClosing(true);

      const m = useMorph.getState();
      const target = m.bannerRect ?? {
        x: space.xl,
        y: device.top + space.sm,
        width: sw.get() - space.xl * 2,
        height: 68,
      };
      fx.set(target.x);
      fy.set(target.y);
      fw.set(target.width);
      fh.set(target.height);
      fr.set(BANNER_RADIUS);
      setShowBannerCopy(true);
      setShowGhostStrip(true);

      p.set(withTiming(0, { duration: CLOSE_MS, easing: ease }, (done) => {
        if (done) runOnJS(finishClose)();
      }));
    },
    [device.top, finishClose, fx, fy, fw, fh, fr, p, sw]
  );

  const fadeOut = useCallback(
    (then: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      afterRef.current = then;
      setClosing(true);
      fade.set(withTiming(0, { duration: FADE_MS }, (done) => {
        if (done) runOnJS(finishFade)();
      }));
    },
    [fade, finishFade]
  );

  // A screen on top (e.g. "Driver found") asked us to minimise once we're visible again.
  // We must wait until that screen has COMPLETELY gone: on iPhone, closing this screen while
  // the one on top is still animating away gets ignored, which left an invisible screen
  // covering the app (the freeze).
  const closeIfRequested = useCallback(() => {
    if (!useMorph.getState().closeRequested) return;
    useMorph.getState().clearCloseRequest();
    close();
  }, [close]);

  // "transitionEnd" (not closing) = we're fully visible again.
  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd' as never, (e: { data?: { closing?: boolean } }) => {
      if (!e?.data?.closing) closeIfRequested();
    });
    return unsubscribe;
  }, [navigation, closeIfRequested]);

  // Backup, in case that event never arrives.
  useFocusEffect(
    useCallback(() => {
      if (!useMorph.getState().closeRequested) return;
      const timer = setTimeout(closeIfRequested, 700);
      return () => clearTimeout(timer);
    }, [closeIfRequested])
  );

  // ---- Styles that run on the UI thread ----
  const windowStyle = useAnimatedStyle(() => {
    const t = p.get();
    return {
      left: interpolate(t, [0, 1], [fx.get(), 0]),
      top: interpolate(t, [0, 1], [fy.get(), 0]),
      width: interpolate(t, [0, 1], [fw.get(), sw.get()]),
      height: interpolate(t, [0, 1], [fh.get(), sh.get()]),
      borderRadius: interpolate(t, [0, 1], [fr.get(), 0]),
    };
  });

  // The screen inside moves the opposite way, so it stays still while the window grows.
  const contentStyle = useAnimatedStyle(() => {
    const t = p.get();
    return {
      width: sw.get(),
      height: sh.get(),
      transform: [
        { translateX: -interpolate(t, [0, 1], [fx.get(), 0]) },
        { translateY: -interpolate(t, [0, 1], [fy.get(), 0]) },
      ],
    };
  });

  const bannerCopyStyle = useAnimatedStyle(() => ({
    width: fw.get(),
    opacity: interpolate(p.get(), [0, 0.3], [1, 0], 'clamp'),
  }));

  const tintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.get(), [0, 0.35], [1, 0], 'clamp'),
  }));

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));

  const stripHeight = useMorph((s) => s.stripHeight) || device.top + space.sm * 2 + 68;
  const controls = useMemo(() => ({ ready, closing, close, fadeOut }), [ready, closing, close, fadeOut]);

  return (
    <MorphContext.Provider value={controls}>
      <SafeAreaInsetsContext.Provider value={device}>
        <Animated.View
          style={[styles.root, fadeStyle]}
          onLayout={(e) => {
            sw.set(e.nativeEvent.layout.width);
            sh.set(e.nativeEvent.layout.height);
          }}
        >
          {/* A stand-in for the banner strip's background while the window is small */}
          {showGhostStrip && <View pointerEvents="none" style={[styles.ghostStrip, { height: stripHeight }]} />}

          <Animated.View style={[styles.window, windowStyle]}>
            <Animated.View
              style={[styles.content, contentStyle]}
              pointerEvents={ready && !closing ? 'auto' : 'none'}
            >
              {children}
            </Animated.View>

            {origin?.tint && !ready && (
              <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: origin.tint }, tintStyle]} />
            )}

            {showBannerCopy && (
              <Animated.View pointerEvents="none" style={[styles.bannerCopy, bannerCopyStyle]}>
                <LiveTripBanner />
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
      </SafeAreaInsetsContext.Provider>
    </MorphContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  ghostStrip: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.bg.canvas },
  window: { position: 'absolute', overflow: 'hidden', backgroundColor: colors.bg.canvas },
  content: { position: 'absolute', top: 0, left: 0 },
  bannerCopy: { position: 'absolute', top: 0, left: 0 },
});