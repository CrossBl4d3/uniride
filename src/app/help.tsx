// src/app/help.tsx — 37 Help & support
import { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet, Alert, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useRides } from '../store/useRides';
import { clockAt, dayLabel, naira } from '../utils/format';
import { colors, space, radius, type } from '../theme';

const topics = [
  {
    title: 'I was charged the wrong fare',
    answer:
      'You see the full price before you book, and that’s what you pay. If your receipt doesn’t match, tap Report on the trip and we’ll refund the difference to your wallet.',
  },
  {
    title: 'I left something in a Keke',
    answer:
      'Open the trip from Rides, tap Get help, then Report → Lost item. We’ll pass your message to the driver without sharing your number.',
  },
  {
    title: 'Refunds and cancellations',
    answer:
      'Cancelling within 2 minutes of booking is free. Wallet refunds arrive instantly; card refunds take 3–5 working days.',
  },
  {
    title: 'Student fares and verification',
    answer:
      'Add your school email (ending in .edu.ng) in Account → Personal info. Verified students get ₦20 off every ride.',
  },
  {
    title: 'Report a safety concern',
    answer:
      'If you’re in danger right now, use SOS. For anything else, email us and a safety specialist will reply within an hour.',
  },
];

export default function Help() {
  const insets = useSafeAreaInsets();
  // Opened from a specific ride? Show that one; otherwise your most recent.
  const { rideId } = useLocalSearchParams<{ rideId?: string }>();
  const rides = useRides((s) => s.rides);
  const ride = rides.find((r) => r.id === rideId) ?? rides[0];

  const [query, setQuery] = useState('');
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const shown = q
    ? topics.filter((t) => t.title.toLowerCase().includes(q) || t.answer.toLowerCase().includes(q))
    : topics;

  const report = () => {
    if (!ride) return;
    const logged = (what: string) =>
      Alert.alert('Report sent', `We’ve logged “${what}” for trip #${ride.id}. We’ll reply by email within 24 hours.`);
    Alert.alert('What went wrong?', `${ride.pickupName} → ${ride.destinationName}`, [
      { text: 'Wrong fare', onPress: () => logged('Wrong fare') },
      { text: 'Lost item', onPress: () => logged('Lost item') },
      { text: 'Driver behaviour', onPress: () => logged('Driver behaviour') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const emailSupport = () => {
    const subject = encodeURIComponent(ride ? `Help with trip #${ride.id}` : 'Help with UniRide');
    Linking.openURL(`mailto:support@uniride.app?subject=${subject}`);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar title="Help & support" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField placeholder="Search help articles" leadingIcon="search" value={query} onChangeText={setQuery} />

        {ride && !q && (
          <>
            <Text style={styles.overline}>{rideId ? 'This trip' : 'Your last trip'}</Text>
            <View style={[styles.card, styles.tripRow]}>
              <View style={styles.icon}>
                <Icon name={ride.rideType === 'keke' ? 'keke' : 'car'} size={20} color={colors.icon.accent} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {ride.pickupName} → {ride.destinationName}
                </Text>
                <Text style={styles.detail}>
                  {dayLabel(ride.startedAt)} · {clockAt(ride.startedAt)} · {naira(ride.charged)}
                </Text>
              </View>
              <Pressable onPress={report} hitSlop={8}>
                <Text style={styles.link}>Report</Text>
              </Pressable>
            </View>
          </>
        )}

        <Text style={styles.overline}>{q ? 'Results' : 'Popular topics'}</Text>
        <View style={styles.card}>
          {shown.map((t, i) => {
            const open = openTopic === t.title;
            return (
              <Pressable
                key={t.title}
                onPress={() => setOpenTopic(open ? null : t.title)} // tap again to close
                style={[styles.topic, i < shown.length - 1 && styles.divider]}
              >
                <View style={styles.topicHead}>
                  <Icon name="help" size={20} color={colors.icon.accent} />
                  <Text style={[styles.title, { flex: 1 }]}>{t.title}</Text>
                  <Icon name={open ? 'chevron-down' : 'chevron-right'} size={20} color={colors.icon.muted} />
                </View>
                {open && <Text style={styles.answer}>{t.answer}</Text>}
              </Pressable>
            );
          })}
          {shown.length === 0 && <Text style={styles.empty}>No articles match “{query.trim()}”.</Text>}
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button
          label="Email support"
          fullWidth
          icon={<Icon name="mail" size={18} color={colors.text.onAccent} />}
          onPress={emailSupport}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space['2xl'], gap: space.md },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space.md },
  card: {
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bg.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.bodyStrong, color: colors.text.primary },
  detail: { ...type.caption, color: colors.text.secondary },
  link: { ...type.captionStrong, color: colors.text.accent },
  topic: { paddingVertical: space.lg, gap: space.sm },
  topicHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  answer: { ...type.body, color: colors.text.secondary, paddingLeft: 32 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border.hairline },
  empty: { ...type.body, color: colors.text.tertiary, textAlign: 'center', paddingVertical: space.xl },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md },
});