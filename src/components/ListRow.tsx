// src/components/ListRow.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, space, radius, type } from '../theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;          // shown in the green rounded square on the left
  trailingText?: string;    // e.g. "Selected" or "1.2 km"
  trailingAccent?: boolean; // make the trailing text green
  chevron?: boolean;        // the ">" arrow for rows that open another screen
  divider?: boolean;        // thin line under the row
  onPress?: () => void;
};

export function ListRow({
  title,
  subtitle,
  icon,
  trailingText,
  trailingAccent = false,
  chevron = false,
  divider = true,
  onPress,
}: ListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && { opacity: 0.7 }]}
    >
      {icon && (
        <View style={styles.lead}>
          <Icon name={icon} size={22} color={colors.icon.accent} />
        </View>
      )}

      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>

      {trailingText && (
        <Text style={[styles.trailing, trailingAccent && { color: colors.text.accent }]}>
          {trailingText}
        </Text>
      )}
      {chevron && <Icon name="chevron-right" size={20} color={colors.icon.muted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border.hairline },
  lead: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: { ...type.bodyStrong, color: colors.text.primary },
  subtitle: { ...type.caption, color: colors.text.secondary },
  trailing: { ...type.captionStrong, color: colors.text.secondary },
});