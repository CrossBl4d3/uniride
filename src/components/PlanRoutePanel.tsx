// src/components/PlanRoutePanel.tsx — 10 Plan route + 11 Search results
// Lives inside the Home sheet: it appears when the sheet grows to full screen.
import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet, Alert, Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { TopBar } from './TopBar';
import { TextField } from './TextField';
import { ListRow } from './ListRow';
import { Icon } from './Icon';
import { recentPlaces, savedPlaces, searchablePlaces, Place } from '../data/places';
import { useBooking } from '../store/useBooking';
import { colors, space, radius, type } from '../theme';

type Props = {
  initialQuery?: string;
  onClose: () => void;
};

export function PlanRoutePanel({ initialQuery = '', onClose }: Props) {
  const pickup = useBooking((s) => s.pickup);
  const destination = useBooking((s) => s.destination);
  const setDestination = useBooking((s) => s.setDestination);
  const swap = useBooking((s) => s.swap);
  const [query, setQuery] = useState(initialQuery);

  const q = query.trim().toLowerCase();
  const results = q
    ? searchablePlaces.filter(
        (p) => p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)
      )
    : [];

  const choose = (place: Place) => {
    setDestination(place);
    setQuery(place.name);
    Keyboard.dismiss();
    router.push('/booking/ride');
  };

  const onSwap = () => {
    if (!destination) {
      Alert.alert('Pick a destination first', 'Then you can swap it with your pickup.');
      return;
    }
    swap();
    setQuery(pickup.name);
  };

  const chooseOnMap = () => Alert.alert('Coming soon', 'Dropping a pin on the map is the next screen.');

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar leading="close" title="Plan your route" onLeadingPress={onClose} />

      <View style={styles.routeCard}>
        <View style={styles.routeLine}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <View style={styles.square} />
        </View>

        <View style={styles.fields}>
          <View style={styles.fromField}>
            <Text style={styles.fromText} numberOfLines={1}>
              {pickup.name} · {pickup.area}
            </Text>
          </View>
          <TextField
            placeholder="Where to?"
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            trailingIcon="map"
            onTrailingPress={chooseOnMap}
          />
        </View>

        <Pressable style={styles.swap} onPress={onSwap} accessibilityLabel="Swap pickup and destination">
          <Icon name="swap" size={20} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {q ? (
          results.length > 0 ? (
            results.map((p) => (
              <ListRow
                key={p.id}
                icon="pin"
                title={p.name}
                subtitle={p.area}
                trailingText={p.distance}
                onPress={() => choose(p)}
              />
            ))
          ) : (
            <Text style={styles.empty}>No places match “{query.trim()}”. Try choosing on the map.</Text>
          )
        ) : (
          <>
            <ListRow icon="map" title="Choose on map" subtitle="Drop a pin anywhere on campus" chevron onPress={chooseOnMap} />

            <Text style={styles.overline}>Recent</Text>
            {recentPlaces.map((p) => (
              <ListRow key={p.id} icon="clock" title={p.name} subtitle={p.area} trailingText={p.distance} onPress={() => choose(p)} />
            ))}

            <Text style={styles.overline}>Saved</Text>
            {savedPlaces.map((s) => (
              <ListRow key={s.label} icon={s.icon} title={s.label} subtitle={s.place.name} chevron onPress={() => choose(s.place)} />
            ))}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  routeLine: { alignItems: 'center', alignSelf: 'stretch', paddingVertical: 24 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.bg.accent },
  line: { width: 2, flex: 1, marginVertical: space.xs, backgroundColor: colors.border.default },
  square: { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.text.primary },
  fields: { flex: 1, gap: space.sm },
  fromField: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.brand,
  },
  fromText: { ...type.bodyLarge, color: colors.text.primary },
  swap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: space.xl, paddingBottom: space['3xl'] },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space['2xl'], marginBottom: space.xs },
  empty: { ...type.body, color: colors.text.tertiary, textAlign: 'center', paddingVertical: space['2xl'] },
});