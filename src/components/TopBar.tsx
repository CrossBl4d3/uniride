// src/components/TopBar.tsx
import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { colors, space, type } from '../theme';

type TopBarProps = {
  leading?: 'back' | 'close' | 'none';
  title?: string;
  onLeadingPress?: () => void; // if not given, the button just goes back
  trailing?: ReactNode;        // optional thing on the right (e.g. a "Skip" link)
};

export function TopBar({ leading = 'back', title, onLeadingPress, trailing }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { marginTop: insets.top }]}>
      <View style={styles.side}>
        {leading !== 'none' && (
          <Pressable
            onPress={onLeadingPress ?? (() => router.back())}
            hitSlop={8}
            accessibilityLabel={leading === 'close' ? 'Close' : 'Go back'}
            style={({ pressed }) => [styles.circle, pressed && { opacity: 0.7 }]}
          >
            <Icon name={leading === 'close' ? 'close' : 'arrow-left'} size={20} />
          </Pressable>
        )}
      </View>

      {title ? (
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <View style={[styles.side, { alignItems: 'flex-end' }]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    gap: space.md,
  },
  side: { width: 40 }, // same width both sides, so a title stays truly centred
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.h3, flex: 1, textAlign: 'center', color: colors.text.primary },
});