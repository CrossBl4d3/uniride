// src/components/ProgressBar.tsx
// With a value (0..1): a normal progress bar.
// Without one: an "indeterminate" bar that slides back and forth (we don't know how long).
import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { colors } from '../theme';

export function ProgressBar({ value }: { value?: number }) {
  const [width, setWidth] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value !== undefined) return;
    const loop = Animated.loop(
      Animated.timing(slide, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [value, slide]);

  return (
    <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {value !== undefined ? (
        <View style={[styles.fill, { width: `${Math.round(value * 100)}%` as const }]} />
      ) : (
        <Animated.View
          style={[
            styles.fill,
            {
              width: '35%',
              transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [-0.35 * width, width] }) }],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: colors.bg.surfaceRaised },
  fill: { height: 4, borderRadius: 2, backgroundColor: colors.bg.accent },
});