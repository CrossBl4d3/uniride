// src/app/campus.tsx — 07 Choose your campus
import { useState } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { TextField } from '../components/TextField';
import { ListRow } from '../components/ListRow';
import { Button } from '../components/Button';
import { campuses } from '../data/campuses';
import { useUser } from '../store/useUser';
import { colors, space, type } from '../theme';
import { router } from 'expo-router';

export default function ChooseCampus() {
  const insets = useSafeAreaInsets();
  const savedCampus = useUser((s) => s.campusId);
  const setCampus = useUser((s) => s.setCampus);

  // Start with whatever was saved before (useful when switching campus later).
  const [selected, setSelected] = useState<string | null>(savedCampus);
  const [query, setQuery] = useState('');

  // Filtering is a derived value: recalculated on every keystroke, never stored.
  const q = query.trim().toLowerCase();
  const results = campuses.filter(
    (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
  );

   const confirm = () => {
    if (!selected) return;
    setCampus(selected);
    router.push('/location');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar leading="close" title="Choose your campus" />

      <View style={styles.search}>
        <TextField
          placeholder="Search universities"
          leadingIcon="search"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ListRow
            icon="school"
            title={item.name}
            subtitle={item.location}
            trailingText={item.id === selected ? 'Selected' : undefined}
            trailingAccent
            onPress={() => setSelected(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.note}>No universities match “{query.trim()}”.</Text>
        }
        ListFooterComponent={
          results.length > 0 ? <Text style={styles.note}>More campuses are coming soon.</Text> : null
        }
      />

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button label="Continue" fullWidth disabled={!selected} onPress={confirm} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  search: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.sm },
  list: { paddingHorizontal: space.xl },
  note: { ...type.caption, color: colors.text.tertiary, textAlign: 'center', paddingVertical: space['2xl'] },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.lg },
});