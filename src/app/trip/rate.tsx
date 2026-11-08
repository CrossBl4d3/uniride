// src/app/trip/rate.tsx — 20 Trip complete: Rate driver
import { useCallback, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Keyboard, BackHandler,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { MorphScreen, useMorphScreen } from '../../components/MorphScreen';
import { useTrip } from '../../store/useTrip';
import { useBooking } from '../../store/useBooking';
import { naira } from '../../utils/format';
import { colors, space, radius, type } from '../../theme';

// Same star shape as the icon set, but this one can be filled in.
const STAR = 'M12 3L14.8 8.7L21 9.6L16.5 14L17.6 20.2L12 17.3L6.4 20.2L7.5 14L3 9.6L9.2 8.7L12 3Z';

function Star({ filled }: { filled: boolean }) {
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24">
      <Path
        d={STAR}
        fill={filled ? colors.bg.accent : 'none'}
        stroke={filled ? colors.bg.accent : colors.border.strong}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const headings = [
  '',
  'Terrible — what went wrong?',
  'Poor — what went wrong?',
  'Okay — what could be better?',
  'Great — what went well?',
  'Excellent — what went well?',
];
const goodTags = (vehicle: string) => ['Safe driving', 'Friendly', 'On time', `Clean ${vehicle}`, 'Knew the route'];
const badTags = ['Unsafe driving', 'Late pickup', 'Rude', 'Dirty vehicle', 'Wrong route'];

// Grows out of the banner (or fades in over tracking) like the other trip screens.
export default function RateScreen() {
  return (
    <MorphScreen>
      <RateDriver />
    </MorphScreen>
  );
}

function RateDriver() {
  const insets = useSafeAreaInsets();
  const { fadeOut } = useMorphScreen();
  // A snapshot of the finished ride. The live trip is cleared when you leave, but this
  // screen keeps showing the ride while it fades away.
  const [trip] = useState(() => useTrip.getState());
  const driver = trip.driver;
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const finishing = useRef(false);

  // Clear the ride FIRST (Home settles behind this screen, banner gone), then fade away to Home.
  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    Keyboard.dismiss();
    useTrip.getState().reset();
    useBooking.getState().reset();
    fadeOut(() => router.dismissTo('/home'));
  }, [fadeOut]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        finish();
        return true;
      });
      return () => sub.remove();
    }, [finish])
  );

  if (!driver) return null;

  const options = stars >= 4 ? goodTags(driver.vehicle) : badTags;

  const rate = (n: number) => {
    // Moving between "went well" and "went wrong" swaps the chips, so clear old picks.
    if ((n >= 4) !== (stars >= 4)) setTags([]);
    setStars(n);
  };
  const toggle = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const submit = () => {
    // Later: send { stars, tags, comment } to the backend here.
    finish();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar leading="close" onLeadingPress={finish} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatar}>
          <Text style={styles.initials}>{driver.initials}</Text>
        </View>
        <Text style={styles.title}>You’ve arrived!</Text>
        <Text style={styles.body}>
          {trip.destinationName} · {trip.tripMin} min · {naira(trip.total)}{' '}
          {trip.paidWith === 'Cash' ? 'in cash' : 'paid'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.question}>How was your ride with {driver.firstName}?</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => rate(n)}
                hitSlop={4}
                accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star filled={n <= stars} />
              </Pressable>
            ))}
          </View>

          {stars > 0 && (
            <>
              <Text style={styles.prompt}>{headings[stars]}</Text>
              <View style={styles.tags}>
                {options.map((tag) => {
                  const on = tags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => toggle(tag)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                    >
                      <Chip variant={on ? 'accent' : 'neutral'} icon={on ? 'check' : undefined} label={tag} />
                    </Pressable>
                  );
                })}
              </View>
              <TextField
                placeholder="Add a comment (optional)"
                leadingIcon="edit"
                value={comment}
                onChangeText={setComment}
                returnKeyType="done"
              />
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.md }]}>
        <Button label="Submit rating" fullWidth disabled={stars === 0} onPress={submit} />
        <Button label="Skip" variant="ghost" fullWidth onPress={finish} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { alignItems: 'center', gap: space.sm, paddingHorizontal: space.xl, paddingBottom: space['2xl'] },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: space.md,
    backgroundColor: colors.bg.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...type.h3, color: colors.text.accent },
  title: { ...type.h1, color: colors.text.primary, textAlign: 'center' },
  body: { ...type.body, color: colors.text.secondary, textAlign: 'center' },
  card: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: space.lg,
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  question: { ...type.h3, color: colors.text.primary, textAlign: 'center' },
  stars: { flexDirection: 'row', gap: space.sm },
  prompt: { ...type.captionStrong, color: colors.text.secondary },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.xs },
});