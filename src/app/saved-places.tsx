// src/app/saved-places.tsx — 32 Saved places
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { ListRow } from '../components/ListRow';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { usePlaces, SavedPlace } from '../store/usePlaces';
import { useBooking } from '../store/useBooking';
import { colors, space, radius, type } from '../theme';

export default function SavedPlaces() {
  const insets = useSafeAreaInsets();
  const saved = usePlaces((s) => s.saved);
  const remove = usePlaces((s) => s.remove);
  const setDestination = useBooking((s) => s.setDestination);

  const open = (s: SavedPlace) =>
    Alert.alert(s.label, s.place.name, [
      {
        text: 'Book a ride here',
        onPress: () => {
          setDestination(s.place);
          router.push('/booking/ride');
        },
      },
      { text: 'Remove', style: 'destructive', onPress: () => remove(s.label) },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <View style={styles.screen}>
      <TopBar title="Saved places" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Saved places show up as shortcuts on Home, so you can book in one tap.</Text>

        {saved.length > 0 ? (
          <View style={styles.card}>
            {saved.map((s, i) => (
              <ListRow
                key={s.label}
                icon={s.icon}
                title={s.label}
                subtitle={s.place.name}
                chevron
                divider={i < saved.length - 1}
                onPress={() => open(s)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No saved places yet.</Text>
        )}
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button
          label="Add a place"
          variant="secondary"
          fullWidth
          icon={<Icon name="plus" size={18} />}
          onPress={() => router.push('/add-place')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.lg },
  intro: { ...type.body, color: colors.text.secondary },
  card: {
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  empty: { ...type.body, color: colors.text.tertiary, textAlign: 'center', paddingVertical: space['3xl'] },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md },
});