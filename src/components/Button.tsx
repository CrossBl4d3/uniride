// src/components/Button.tsx
import { ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { colors, space, radius, type } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'large' | 'small';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary:   { bg: colors.bg.accent,        text: colors.text.onAccent },
  secondary: { bg: colors.bg.surfaceRaised, text: colors.text.primary, border: colors.border.default },
  ghost:     { bg: 'transparent',           text: colors.text.accent },
  danger:    { bg: colors.bg.errorSubtle,   text: colors.status.error },
  outline:   { bg: 'transparent',           text: colors.text.accent, border: colors.border.strong },
};

const sizeStyles: Record<Size, { height: number; paddingX: number; fontSize: number }> = {
  large: { height: 56, paddingX: space['2xl'], fontSize: 16 },
  small: { height: 40, paddingX: space.lg, fontSize: 14 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      style={({ pressed }) => [
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.paddingX,
          backgroundColor: v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1 : 0,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[type.button, { fontSize: s.fontSize, color: v.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
});