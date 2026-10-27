// src/app/index.tsx — temporary component showcase
import { useState } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Icon, iconPaths, IconName } from '../components/Icon';
import { TextField } from '../components/TextField';
import { colors, space, type } from '../theme';

const variants = ['primary', 'secondary', 'ghost', 'danger', 'outline'] as const;

export default function Index() {
  const [destination, setDestination] = useState('');
  const [phone, setPhone] = useState('');

  // A real validation rule: Nigerian numbers after +234 are 10 digits.
  const phoneError = phone.length > 0 && phone.length !== 10 ? 'Enter a valid 10-digit number' : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.canvas }}>
      <ScrollView
        contentContainerStyle={{ padding: space['2xl'], gap: space.lg }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---------- TEXT FIELDS ---------- */}
        <Text style={[type.h2, { color: colors.text.primary }]}>Text fields</Text>

        <TextField
          placeholder="Search for a place"
          leadingIcon="search"
          trailingIcon="map"
          onTrailingPress={() => Alert.alert('Open map')}
          value={destination}
          onChangeText={setDestination}
        />

        <TextField
          label="Phone number"
          placeholder="801 234 5678"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          error={phoneError}
        />

        <TextField placeholder="Disabled field" leadingIcon="mail" disabled />

        <Text style={[type.body, { color: colors.text.secondary }]}>
          You typed: {destination || '(nothing yet)'}
        </Text>

        {/* ---------- BUTTONS ---------- */}
        <Text style={[type.h2, { color: colors.text.primary }]}>Buttons</Text>

        {variants.map((v) => (
          <View key={v} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <Button label="Continue" variant={v} onPress={() => Alert.alert(`${v} pressed`)} />
            <Button label="Continue" variant={v} size="small" />
            <Button label="Continue" variant={v} size="small" disabled />
          </View>
        ))}

        <Button label="Pay ₦300" fullWidth disabled={!!phoneError || phone.length === 0} />
        <Button
          label="Book a Keke"
          icon={<Icon name="keke" color={colors.text.onAccent} size={20} />}
        />

        {/* ---------- ICONS ---------- */}
        <Text style={[type.h2, { color: colors.text.primary }]}>Icons</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>
          {(Object.keys(iconPaths) as IconName[]).map((name) => (
            <Icon key={name} name={name} color={colors.icon.muted} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}