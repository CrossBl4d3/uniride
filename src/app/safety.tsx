// src/app/safety.tsx — 29 Safety toolkit
import { useRef, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Switch, Animated, Easing, KeyboardAvoidingView, Platform, StyleSheet, Alert, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { TopBar } from '../components/TopBar';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { ListRow } from '../components/ListRow';
import { Icon } from '../components/Icon';
import { useSafety, Contact } from '../store/useSafety';
import { colors, space, radius, type } from '../theme';

const HOLD_MS = 2000;

export default function SafetyToolkit() {
  const safety = useSafety();

  const hold = useRef(new Animated.Value(0)).current;
  const [holding, setHolding] = useState(false);

  // Held for the full 2 seconds: open the Emergency SOS screen.
  const triggerSOS = () => router.push('/sos');

  const startHold = () => {
    setHolding(true);
    Animated.timing(hold, { toValue: 1, duration: HOLD_MS, easing: Easing.linear, useNativeDriver: false }).start(
      ({ finished }) => {
        if (!finished) return;
        setHolding(false);
        hold.setValue(0);
        triggerSOS();
      }
    );
  };
  const releaseHold = () => {
    hold.stopAnimation();
    setHolding(false);
    Animated.timing(hold, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const canAdd = name.trim() !== '' && phone.replace(/\D/g, '').length >= 10;

  const saveContact = () => {
    safety.addContact(name.trim(), phone.trim());
    setName('');
    setPhone('');
    setAdding(false);
  };

  const openContact = (c: Contact) =>
    Alert.alert(c.name, c.phone, [
      { text: 'Call', onPress: () => Linking.openURL(`tel:${c.phone.replace(/\s/g, '')}`) },
      { text: 'Remove', style: 'destructive', onPress: () => safety.removeContact(c.id) },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar title="Safety toolkit" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.sosCard}>
          <View style={styles.sosTitleRow}>
            <Icon name="sos" size={22} color={colors.status.error} />
            <Text style={styles.sosTitle}>Emergency SOS</Text>
          </View>
          <Text style={styles.body}>Calls campus security and sends your live location to your trusted contacts.</Text>

          <Pressable onPressIn={startHold} onPressOut={releaseHold} style={styles.holdButton} accessibilityLabel="Hold to call for help">
            <Animated.View
              style={[
                styles.holdFill,
                { width: hold.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            />
            <Icon name="phone" size={18} color={colors.status.error} />
            <Text style={styles.holdText}>{holding ? 'Keep holding…' : 'Hold to call for help'}</Text>
          </Pressable>
        </View>

        <Text style={styles.overline}>Trusted contacts</Text>
        <View style={styles.card}>
          {safety.contacts.map((c) => (
            <ListRow
              key={c.id}
              icon="user"
              title={c.name}
              subtitle={c.everyTrip ? `${c.phone} · Gets every trip` : c.phone}
              onPress={() => openContact(c)}
            />
          ))}

          {adding ? (
            <View style={styles.form}>
              <TextField placeholder="Name" value={name} onChangeText={setName} autoCapitalize="words" autoFocus />
              <TextField placeholder="+234 801 234 5678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <View style={styles.formButtons}>
                <Button label="Cancel" size="small" variant="ghost" onPress={() => setAdding(false)} style={styles.half} />
                <Button label="Save contact" size="small" disabled={!canAdd} onPress={saveContact} style={styles.half} />
              </View>
            </View>
          ) : (
            <Pressable style={styles.addRow} onPress={() => setAdding(true)}>
              <View style={styles.addIcon}>
                <Icon name="plus" size={20} color={colors.icon.accent} />
              </View>
              <Text style={styles.addText}>Add a trusted contact</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.overline}>On every ride</Text>
        <View style={styles.card}>
          <View style={[styles.switchRow, styles.divider]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Share trips automatically</Text>
              <Text style={styles.switchSub}>Trusted contacts get a live link</Text>
            </View>
            <Switch
              value={safety.shareTrips}
              onValueChange={safety.setShareTrips}
              trackColor={{ false: colors.bg.surfaceRaised, true: colors.bg.accent }}
              thumbColor={colors.text.primary}
              ios_backgroundColor={colors.bg.surfaceRaised}
            />
          </View>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Trip PIN</Text>
              <Text style={styles.switchSub}>Driver must enter your PIN to start</Text>
            </View>
            <Switch
              value={safety.tripPin}
              onValueChange={safety.setTripPin}
              trackColor={{ false: colors.bg.surfaceRaised, true: colors.bg.accent }}
              thumbColor={colors.text.primary}
              ios_backgroundColor={colors.bg.surfaceRaised}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space['3xl'], gap: space.md },
  sosCard: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.bg.errorSubtle,
  },
  sosTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  sosTitle: { ...type.h3, color: colors.text.primary },
  body: { ...type.body, color: colors.text.secondary },
  holdButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 107, 94, 0.18)',
  },
  holdFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 94, 0.45)',
  },
  holdText: { ...type.button, color: colors.status.error },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space.md },
  card: {
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  form: { gap: space.md, paddingVertical: space.lg },
  formButtons: { flexDirection: 'row', gap: space.sm },
  half: { flex: 1 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { ...type.bodyStrong, color: colors.text.accent },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border.hairline },
  switchTitle: { ...type.bodyStrong, color: colors.text.primary },
  switchSub: { ...type.caption, color: colors.text.secondary },
});