// src/app/(tabs)/rides.tsx — placeholder until Stage 6
import { View, Text } from 'react-native';
import { colors, type } from '../../theme';

export default function Wallet() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.screen, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[type.h2, { color: colors.text.primary }]}>Wallet</Text>
      <Text style={[type.body, { color: colors.text.secondary }]}>Coming in Stage 6</Text>
    </View>
  );
}