// src/components/TabBar.tsx — the Figma "Nav/Tab bar"
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from './Icon';
import { colors, space, radius, type } from '../theme';

// Label and icon for each tab, keyed by the screen's file name.
const tabs: Record<string, { label: string; icon: IconName }> = {
  home: { label: 'Home', icon: 'home' },
  rides: { label: 'Rides', icon: 'rides' },
  wallet: { label: 'Wallet', icon: 'wallet' },
  account: { label: 'Account', icon: 'user' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.sm) }]}>
      {state.routes.map((route, index) => {
        const tab = tabs[route.name];
        if (!tab) return null;
        const focused = state.index === index;

        const onPress = () => {
          // Let the screen know it was tapped, then switch to it if it isn't open already.
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
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
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: space.md,
    backgroundColor: colors.bg.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
  tab: { flex: 1, alignItems: 'center', gap: space.xs },
  indicator: {
    width: 64,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorActive: { backgroundColor: colors.bg.accentSubtle }, // the green pill behind the active icon
  label: { ...type.captionStrong, color: colors.text.secondary },
  labelActive: { color: colors.text.accent },
});