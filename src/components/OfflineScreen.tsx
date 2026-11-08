// src/components/OfflineScreen.tsx — 30 You're offline
// Not a route: an overlay that sits on top of the WHOLE app and appears by itself
// whenever the connection drops, on any screen.
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Linking } from 'react-native';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from './Button';
import { Icon } from './Icon';
import { useUI } from '../store/useUI';
import { useTrip } from '../store/useTrip';
import { colors, space, type } from '../theme';

export function OfflineScreen() {
  const insets = useSafeAreaInsets();
  const net = useNetInfo();
  const simulate = useUI((s) => s.simulateOffline);
  const setSimulate = useUI((s) => s.setSimulateOffline);
  const driver = useTrip((s) => s.driver);
  const status = useTrip((s) => s.status);

  const offline = simulate || net.isConnected === false || net.isInternetReachable === false;

  const [shown, setShown] = useState(false);
  const [checking, setChecking] = useState(false);
  const [stillOffline, setStillOffline] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (offline) {
      setShown(true);
      setStillOffline(false);
    }
    Animated.timing(fade, { toValue: offline ? 1 : 0, duration: 250, useNativeDriver: true }).start(({ finished }) => {
      if (finished && !offline) setShown(false);
    });
  }, [offline, fade]);

  if (!shown) return null;

  const liveTrip = !!driver && ['found', 'arriving', 'arrived', 'onTrip'].includes(status);

  const tryAgain = async () => {
    setChecking(true);
    setStillOffline(false);
    setSimulate(false);
    const state = await NetInfo.refresh();
    setChecking(false);
    if (state.isConnected === false || state.isInternetReachable === false) setStillOffline(true);
  };

  return (
    <Animated.View
      style={[styles.screen, { opacity: fade, paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}
      accessibilityViewIsModal
    >
      <View style={styles.illustration}>
        <View style={styles.outer}>
          <View style={styles.inner}>
            <Icon name="wifi-off" size={72} color={colors.icon.muted} strokeWidth={1.4} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>You’re offline</Text>
        <Text style={styles.body}>
          Check your mobile data or Wi-Fi. If you’re on a trip, your driver and route are saved and will update when you
          reconnect.
        </Text>
        {stillOffline && <Text style={styles.warning}>Still no connection. Try again in a moment.</Text>}
      </View>

      <View style={styles.actions}>
        <Button label="Try again" fullWidth loading={checking} onPress={tryAgain} />
        {liveTrip && driver && (
          <Button
            label="Call your driver"
            variant="secondary"
            fullWidth
            icon={<Icon name="phone" size={18} />}
            onPress={() => Linking.openURL(`tel:${driver.phone}`)}
          />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.bg.screen,
  },
  illustration: { alignItems: 'center', marginTop: 140 },
  outer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: space.xl, marginTop: space['3xl'], gap: space.md },
  title: { ...type.h1, color: colors.text.primary, textAlign: 'center' },
  body: { ...type.body, color: colors.text.secondary, textAlign: 'center' },
  warning: { ...type.captionStrong, color: colors.status.warning, textAlign: 'center' },
  actions: { marginTop: 'auto', paddingHorizontal: space.xl, gap: space.sm },
});