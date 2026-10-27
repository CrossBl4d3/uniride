// src/components/Chip.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, space, radius, type } from '../theme';

// The five Chip styles from the Figma component.
type ChipStyle = 'accent' | 'neutral' | 'warning' | 'error' | 'solid';

const chipColors: Record<ChipStyle, { bg: string; text: string }> = {
  accent:  { bg: colors.bg.accentSubtle,  text: colors.text.accent },
  neutral: { bg: colors.bg.surfaceRaised, text: colors.text.secondary },
  warning: { bg: colors.bg.warningSubtle, text: colors.status.warning },
  error:   { bg: colors.bg.errorSubtle,   text: colors.status.error },
  solid:   { bg: colors.bg.accent,        text: colors.text.onAccent },
};

type ChipProps = {
  label: string;
  variant?: ChipStyle;
  icon?: IconName;
};

export function Chip({ label, variant = 'neutral', icon }: ChipProps) {
  const c = chipColors[variant];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      {icon && <Icon name={icon} size={14} color={c.text} />}
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start', // hug its content instead of stretching
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    height: 30,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
  },
  label: { ...type.captionStrong },
});