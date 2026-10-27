// src/app/sign-in/phone.tsx — 04 Sign in: Phone number
import { useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { Button } from '../../components/Button';
import { Keypad } from '../../components/Keypad';
import { Icon } from '../../components/Icon';
import { NigeriaFlag } from '../../components/Brand';
import { useBlink } from '../../hooks/useBlink';
import { formatPhone } from '../../utils/format';
import { colors, space, radius, type } from '../../theme';

export default function PhoneNumber() {
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState('');
  const isValid = digits.length === 10;
  const caret = useBlink(); // the whole blink animation, in one line

  const addDigit = (d: string) => {
    setDigits((prev) => {
      if (prev.length === 0 && d === '0') return prev;
      return prev.length < 10 ? prev + d : prev;
    });
  };
  const removeDigit = () => setDigits((prev) => prev.slice(0, -1));

  // Go to the code screen and hand it the number as a "param".
  const goToVerify = () => {
    router.push({ pathname: '/sign-in/verify', params: { phone: digits } });
  };

  return (
    <View style={styles.screen}>
      <TopBar />

      <View style={styles.content}>
        <Text style={styles.title}>What’s your number?</Text>
        <Text style={styles.subtitle}>We’ll text you a 4-digit code to confirm it’s you.</Text>

        <View style={styles.phoneRow}>
          <View style={styles.country}>
            <NigeriaFlag />
            <Text style={styles.value}>+234</Text>
            <Icon name="chevron-down" size={18} color={colors.icon.muted} />
          </View>

          <View style={styles.numberBox}>
            {digits ? <Text style={styles.value}>{formatPhone(digits)}</Text> : null}
            <Animated.View style={[styles.caret, { opacity: caret }]} />
            {!digits && <Text style={[styles.value, styles.placeholder]}>803 456 7821</Text>}
          </View>
        </View>

        <Text style={styles.note}>Message and data rates may apply.</Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button label="Continue" fullWidth disabled={!isValid} onPress={goToVerify} />
        <Keypad onDigit={addDigit} onDelete={removeDigit} onClear={() => setDigits('')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.sm },
  title: { ...type.h1, color: colors.text.primary },
  subtitle: { ...type.body, color: colors.text.secondary },
  phoneRow: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
  country: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surfaceRaised,
  },
  numberBox: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.focus,
    backgroundColor: colors.bg.surfaceRaised,
  },
  value: { ...type.bodyLarge, color: colors.text.primary },
  placeholder: { color: colors.text.tertiary },
  caret: { width: 2, height: 22, borderRadius: 1, backgroundColor: colors.border.focus },
  note: { ...type.caption, color: colors.text.tertiary },
  bottom: { marginTop: 'auto', paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.lg },
});