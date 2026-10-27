// src/components/Radio.tsx — the Figma "Control/Radio"
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

export function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.ring, { borderColor: selected ? colors.border.focus : colors.border.strong }]}>
      {selected && <View style={styles.dot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.bg.accent },
});