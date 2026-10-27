// src/components/Keypad.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors, space, radius, type } from '../theme';

// The layout is data: 4 rows of keys. '' is the empty slot, 'delete' is backspace.
const rows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'delete'],
];

type KeypadProps = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onClear?: () => void; // long-press delete to wipe everything
};

export function Keypad({ onDigit, onDelete, onClear }: KeypadProps) {
  return (
    <View style={styles.pad}>
      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((key) => {
            if (key === '') return <View key="empty" style={styles.key} />;

            const isDelete = key === 'delete';
            return (
              <Pressable
                key={key}
                onPress={() => (isDelete ? onDelete() : onDigit(key))}
                onLongPress={isDelete ? onClear : undefined}
                accessibilityLabel={isDelete ? 'Delete' : key}
                style={({ pressed }) => [
                  styles.key,
                  !isDelete && styles.keyFilled,
                  pressed && styles.keyPressed,
                ]}
              >
                {isDelete ? <Icon name="arrow-left" /> : <Text style={styles.digit}>{key}</Text>}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  key: {
    flex: 1, // three keys share the row equally
    height: 60,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyFilled: { backgroundColor: colors.bg.surface },
  keyPressed: { backgroundColor: colors.bg.surfaceRaised },
  digit: { ...type.h2, color: colors.text.primary },
});