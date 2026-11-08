// src/components/TripMorph.tsx
// The stand-in card that grows from the banner to full screen (expand) or shrinks back into it
// (minimise). The real screens are swapped underneath while the card covers them.
import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveTripBanner } from './LiveTripBanner';
import { useMorph, Rect } from '../store/useMorph';
import { colors, space, radius } from '../theme';

export function TripMorph() {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const job = useMorph((s) => s.job);
  const bannerRect = useMorph((s) => s.bannerRect);
  const done = useMorph((s) => s.done);

  const t = useRef(new Animated.Value(0)).current; // 0 = small (banner), 1 = full screen
  const opacity = useRef(new Animated.Value(0)).current;
  const [from, setFrom] = useState<Rect | null>(null);
  const [startRadius, setStartRadius] = useState(20);
  const [showBanner, setShowBanner] = useState(true);

  // Where the banner would be, if it hasn't been drawn yet (e.g. the very first ride).
  const fallbackBanner: Rect = { x: space.xl, y: insets.top + space.sm, width: W - space.xl * 2, height: 68 };

  useEffect(() => {
    if (!job) return;

    if (job.kind === 'open') {
      setFrom(job.from ?? bannerRect ?? fallbackBanner);
      setStartRadius(job.radius);
      setShowBanner(job.showBanner);
      t.setValue(0);
      opacity.setValue(1);
      Animated.timing(t, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => {
        job.go(); // the card covers everything now: swap in the tracking screen underneath
        setTimeout(() => {
          // give the map a moment to draw, then fade the card away to reveal it
          Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: false }).start(() => done());
        }, 120);
      });
    } else {
      setFrom(bannerRect ?? fallbackBanner);
      setStartRadius(20);
      setShowBanner(true);
      t.setValue(1);
      opacity.setValue(1);
      job.leave(); // the card covers everything: leave the tracking screen underneath
      Animated.timing(t, { toValue: 0, duration: 340, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start(() => {
        // the card now sits exactly on the real banner: fade it to reveal the banner
        Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: false }).start(() => done());
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  if (!job || !from) return null;

  // Every size and position is an in-between of "the small rectangle" and "the whole screen".
  const between = (small: number, full: number) => t.interpolate({ inputRange: [0, 1], outputRange: [small, full] });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          left: between(from.x, 0),
          top: between(from.y, 0),
          width: between(from.width, W),
          height: between(from.height, H),
          borderRadius: between(Math.min(startRadius, from.height / 2), 0),
          backgroundColor: t.interpolate({ inputRange: [0, 1], outputRange: [colors.bg.brand, colors.bg.canvas] }),
          opacity,
        },
      ]}
    >
      {/* A copy of the banner that fades out as the card grows (and back in as it shrinks) */}
      {showBanner && (
        <Animated.View
          pointerEvents="none"
          style={[styles.bannerCopy, { opacity: t.interpolate({ inputRange: [0, 0.35], outputRange: [1, 0], extrapolate: 'clamp' }) }]}
        >
          <LiveTripBanner />
        </Animated.View>
      )}

      {/* A hint of the tracking screen's bottom sheet rising into place */}
      <Animated.View
        style={[
          styles.sheetHint,
          {
            height: between(0, H * 0.32),
            opacity: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 1] }),
          },
        ]}
      >
        <View style={styles.handle} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute', zIndex: 90, overflow: 'hidden' },
  bannerCopy: { position: 'absolute', top: 0, left: 0, right: 0 },
  sheetHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    alignItems: 'center',
  },
  handle: { width: 40, height: 5, borderRadius: 3, marginTop: space.sm, backgroundColor: colors.border.strong },
});