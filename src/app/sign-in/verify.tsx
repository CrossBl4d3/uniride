// src/app/sign-in/verify.tsx — 05 Sign in: Verify code
import { useEffect, useState } from 'react';
import { View, Text, Animated, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { Button } from '../../components/Button';
import { Keypad } from '../../components/Keypad';
import { useBlink } from '../../hooks/useBlink';
import { useUser } from '../../store/useUser';
import { formatPhone } from '../../utils/format';
import { colors, space, radius, type } from '../../theme';

const CODE_LENGTH = 4;
const RESEND_AFTER = 30;

export default function VerifyCode() {
  const insets = useSafeAreaInsets();
  const { phone = '' } = useLocalSearchParams<{ phone: string }>();
  const setProfile = useUser((s) => s.setProfile);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_AFTER);
  const caret = useBlink();

  useEffect(() => {
    if (seconds === 0) return;
    const tick = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(tick);
  }, [seconds]);

  const addDigit = (d: string) => {
    setError('');
    setCode((prev) => (prev.length < CODE_LENGTH ? prev + d : prev));
  };
  const removeDigit = () => {
    setError('');
    setCode((prev) => prev.slice(0, -1));
  };

  const verify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      if (code === '0000') {
        setError('That code is incorrect. Try again.');
        setCode('');
        return;
      }
      setProfile({ phone }); // the number is confirmed, so save it
      router.replace('/sign-in/details');
    }, 1000);
  };

  return (
    <View style={styles.screen}>
      <TopBar />

      <View style={styles.content}>
        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>
          Sent to +234 {formatPhone(phone)}.{' '}
          <Text style={styles.link} onPress={() => router.back()}>Edit number</Text>
        </Text>

        <View style={styles.cells}>
          {Array.from({ length: CODE_LENGTH }, (_, i) => {
            const digit = code[i];
            const active = i === code.length && !verifying;
            return (
              <View key={i} style={[styles.cell, active && styles.cellActive, !!error && styles.cellError]}>
                {digit ? (
                  <Text style={styles.digit}>{digit}</Text>
                ) : active ? (
                  <Animated.View style={[styles.caret, { opacity: caret }]} />
                ) : null}
              </View>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.resendRow}>
          <Text style={styles.muted}>Didn’t get it? </Text>
          {seconds > 0 ? (
            <Text style={styles.link}>Resend in 0:{String(seconds).padStart(2, '0')}</Text>
          ) : (
            <Pressable onPress={() => setSeconds(RESEND_AFTER)} hitSlop={8}>
              <Text style={styles.link}>Resend code</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button
          label="Verify"
          fullWidth
          disabled={code.length < CODE_LENGTH}
          loading={verifying}
          onPress={verify}
        />
        <Keypad onDigit={addDigit} onDelete={removeDigit} onClear={() => setCode('')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.sm },
  title: { ...type.h1, color: colors.text.primary },
  subtitle: { ...type.body, color: colors.text.secondary },
  link: { ...type.body, color: colors.text.accent },
  muted: { ...type.caption, color: colors.text.tertiary },
  cells: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
  cell: {
    width: 56,
    height: 64,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: { borderWidth: 1.5, borderColor: colors.border.focus },
  cellError: { borderWidth: 1.5, borderColor: colors.status.error },
  digit: { ...type.h2, color: colors.text.primary },
  caret: { width: 2, height: 24, borderRadius: 1, backgroundColor: colors.border.focus },
  error: { ...type.caption, color: colors.status.error },
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  bottom: { marginTop: 'auto', paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.lg },
});