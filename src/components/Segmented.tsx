// src/components/Segmented.tsx — the Figma "Control/Segmented"
// <T extends string> makes this a GENERIC component: it works with any set of
// option values, and TypeScript still checks you only pass ones that exist.
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, space, radius, type } from '../theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.option, on && styles.optionOn]}
          >
            <Text style={[styles.label, on && styles.labelOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  option: { flex: 1, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  optionOn: { backgroundColor: colors.bg.brand },
  label: { ...type.bodyStrong, color: colors.text.secondary },
  labelOn: { color: colors.text.primary },
});