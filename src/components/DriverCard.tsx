// src/components/DriverCard.tsx — avatar, name, rating, plate, message & call
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { Driver } from '../data/drivers';
import { colors, space, radius, type } from '../theme';

type Props = {
  driver: Driver;
  onMessage: () => void;
  onCall: () => void;
  framed?: boolean; // false when it sits inside another card
};

export function DriverCard({ driver, onMessage, onCall, framed = true }: Props) {
  return (
    <View style={[styles.row, framed && styles.framed]}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{driver.initials}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{driver.name}</Text>
          <Icon name="star" size={12} color={colors.status.warning} />
          <Text style={styles.meta}>{driver.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.meta}>{driver.vehicle} · {driver.plate}</Text>
      </View>

      <Pressable style={styles.iconButton} onPress={onMessage} accessibilityLabel={`Message ${driver.firstName}`}>
        <Icon name="message" size={20} />
      </Pressable>
      <Pressable style={[styles.iconButton, styles.call]} onPress={onCall} accessibilityLabel={`Call ${driver.firstName}`}>
        <Icon name="phone" size={20} color={colors.text.onAccent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  framed: {
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surfaceRaised,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bg.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...type.captionStrong, color: colors.text.accent },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  name: { ...type.bodyStrong, color: colors.text.primary, marginRight: space.xs },
  meta: { ...type.caption, color: colors.text.secondary },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  call: { backgroundColor: colors.bg.accent },
});