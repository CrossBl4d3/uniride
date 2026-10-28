// src/app/add-place.tsx — add a saved place: search, current location, or drop a pin
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { TextField } from '../components/TextField';
import { ListRow } from '../components/ListRow';
import { Button } from '../components/Button';
import { IconName } from '../components/Icon';
import { campuses } from '../data/campuses';
import { searchablePlaces, Place } from '../data/places';
import { usePlaces } from '../store/usePlaces';
import { useUser } from '../store/useUser';
import { useUI } from '../store/useUI';
import { placeAt } from '../utils/geocode';
import { colors, space, radius, type } from '../theme';

function iconFor(label: string): IconName {
  if (/hall|home|hostel|room|lodge/i.test(label)) return 'home';
  if (/faculty|class|lecture|dept|department|school|lab/i.test(label)) return 'school';
  return 'pin';
}

export default function AddPlace() {
  const insets = useSafeAreaInsets();
  const saved = usePlaces((s) => s.saved);
  const add = usePlaces((s) => s.add);
  const campusId = useUser((s) => s.campusId);
  const picked = useUI((s) => s.pickedPlace);
  const setPicked = useUI((s) => s.setPickedPlace);

  const [label, setLabel] = useState('');
  const [query, setQuery] = useState('');
  const [place, setPlace] = useState<Place | null>(null);
  const [locating, setLocating] = useState(false);

  // Coming back from the pin screen with a place? Use it, then clear the hand-off.
  useEffect(() => {
    if (picked) {
      setPlace(picked);
      setPicked(null);
    }
  }, [picked, setPicked]);

  const campus = campuses.find((c) => c.id === campusId) ?? campuses[0];
  const campusCentre = { latitude: campus.latitude, longitude: campus.longitude };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      let { granted } = await Location.getForegroundPermissionsAsync();
      if (!granted) granted = (await Location.requestForegroundPermissionsAsync()).granted;
      if (!granted) {
        Alert.alert('Location is off', 'Turn on location for Expo Go in Settings, or choose the place on the map.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const here = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setPlace(await placeAt(here, campusCentre, 'Current location'));
    } catch {
      Alert.alert('Couldn’t find you', 'Try again outside or choose the place on the map.');
    } finally {
      setLocating(false); // runs whether it worked or not
    }
  };

  const q = query.trim().toLowerCase();
  const results = q
    ? searchablePlaces.filter((p) => p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q))
    : searchablePlaces;

  // A place from your location or a pin isn't in the search list, so show it on its own.
  const customPlace = place && !searchablePlaces.some((p) => p.id === place.id) ? place : null;

  const name = label.trim();
  const duplicate = saved.some((s) => s.label.toLowerCase() === name.toLowerCase());
  const canSave = name !== '' && !duplicate && place !== null;

  const save = () => {
    if (!place) return;
    add({ label: name, icon: iconFor(name), place });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar title="Add a place" />

      <View style={styles.fields}>
        <TextField
          label="Name"
          placeholder="e.g. Gym, Mum’s office"
          value={label}
          onChangeText={setLabel}
          autoCapitalize="words"
          error={duplicate ? `You already have a place called “${name}”.` : undefined}
        />
        <TextField
          label="Where is it?"
          placeholder="Search for the place"
          leadingIcon="search"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <ListRow
            icon="locate"
            title="Use my current location"
            subtitle={locating ? 'Finding you…' : 'Save where you are right now'}
            onPress={locating ? undefined : useCurrentLocation}
          />
          <ListRow
            icon="map"
            title="Choose on map"
            subtitle="Drop a pin anywhere"
            chevron
            divider={false}
            onPress={() => router.push({ pathname: '/booking/pin', params: { purpose: 'save' } })}
          />
        </View>

        {customPlace && (
          <View style={styles.card}>
            <ListRow
              icon="check"
              title={customPlace.name}
              subtitle={customPlace.area}
              trailingText="Selected"
              trailingAccent
              divider={false}
            />
          </View>
        )}

        <Text style={styles.overline}>{q ? 'Results' : 'Places'}</Text>
        <View style={styles.card}>
          {results.map((p, i) => (
            <ListRow
              key={p.id}
              icon="pin"
              title={p.name}
              subtitle={p.area}
              trailingText={place?.id === p.id ? 'Selected' : undefined}
              trailingAccent
              divider={i < results.length - 1}
              onPress={() => setPlace(p)}
            />
          ))}
          {results.length === 0 && <Text style={styles.empty}>No places match “{query.trim()}”.</Text>}
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button
          label={place && name ? `Save “${name}”` : 'Save place'}
          fullWidth
          disabled={!canSave}
          onPress={save}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  fields: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.lg },
  list: { padding: space.xl, gap: space.md },
  card: {
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space.sm },
  empty: { ...type.body, color: colors.text.tertiary, textAlign: 'center', paddingVertical: space.xl },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md },
});