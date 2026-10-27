// src/hooks/useBlink.ts
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Returns an animated opacity that blinks 1 → 0 → 1 forever.
// Usage: const caret = useBlink();  <Animated.View style={{ opacity: caret }} />
export function useBlink(speed = 500) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: speed, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: speed, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [opacity, speed]);

  return opacity;
}