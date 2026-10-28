// src/components/TabBar.tsx — the Figma "Nav/Tab bar"
import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from './Icon';
import { useUI } from '../store/useUI';
import { colors, space, radius, type } from '../theme';

const tabs: Record<string, { label: string; icon: IconName }> = {
  home: { label: 'Home', icon: 'home' },
  rides: { label: 'Rides', icon: 'rides' },
  wallet: { label: 'Wallet', icon: 'wallet' },
  account: { label: 'Account', icon: 'user' },
};

// The bar floats over the screens, so screens need to know how tall it is.
export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  return 1 + 10 + 54 + Math.max(insets.bottom, space.sm);
}

// We only use `state` (which tabs exist and which is active).
// Switching tabs goes through Expo Router, like every other screen.
export function TabBar({ state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const height = useTabBarHeight();
  const hidden = useUI((s) => s.sheetExpanded);

  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slide, {
      toValue: hidden ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [hidden, slide]);

  return (
    <Animated.View
      pointerEvents={hidden ? 'none' : 'auto'}
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, space.sm),
          transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, height] }) }],
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = tabs[route.name];
        if (!tab) return null;
        const focused = state.index === index;

        return (
          <Pressable
            key={route.key}
            // "/home", "/rides"... the (tabs) group isn't part of the path.
            onPress={() => {
              if (!focused) router.navigate(`/${route.name}` as never);
            }}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
          >
            <View style={[styles.indicator, focused && styles.indicatorActive]}>
              <Icon name={tab.icon} color={focused ? colors.icon.accent : colors.icon.muted} />
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: space.md,
    backgroundColor: colors.bg.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
  tab: { flex: 1, alignItems: 'center', gap: space.xs },
  indicator: { width: 64, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  indicatorActive: { backgroundColor: colors.bg.accentSubtle },
  label: { ...type.captionStrong, color: colors.text.secondary },
  labelActive: { color: colors.text.accent },
});