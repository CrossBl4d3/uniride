// src/app/personal-info.tsx — 28 Personal info
import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useUser } from '../store/useUser';
import { formatPhone } from '../utils/format';
import { colors, space, type } from '../theme';

const looksLikeEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s);
const isSchoolEmail = (s: string) => s.toLowerCase().endsWith('.edu.ng');

export default function PersonalInfo() {
  const insets = useSafeAreaInsets();
  const user = useUser();

  // Start the form with what's saved; nothing is saved again until you tap Save.
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);

  const trimmedEmail = email.trim();
  let emailError: string | undefined;
  if (trimmedEmail && !looksLikeEmail(trimmedEmail)) {
    emailError = 'That doesn’t look like an email address.';
  } else if (trimmedEmail && !isSchoolEmail(trimmedEmail)) {
    emailError = 'Use your school email (ending in .edu.ng) to get student fares.';
  }

  const changed =
    firstName.trim() !== user.firstName || lastName.trim() !== user.lastName || trimmedEmail !== user.email;
  const canSave = changed && firstName.trim() !== '' && lastName.trim() !== '' && !emailError;
  const initials = ((firstName.trim()[0] ?? '') + (lastName.trim()[0] ?? '')).toUpperCase() || 'U';

  const save = () => {
    user.setProfile({ firstName: firstName.trim(), lastName: lastName.trim(), email: trimmedEmail });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar title="Personal info" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photo}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Pressable
            style={styles.changePhoto}
            hitSlop={8}
            onPress={() => Alert.alert('Change photo', 'Profile photos come later.')}
          >
            <Icon name="edit" size={14} color={colors.text.accent} />
            <Text style={styles.link}>Change photo</Text>
          </Pressable>
        </View>

        <TextField label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
        <TextField label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />

        <View style={{ gap: space.sm }}>
          <TextField label="Phone number" value={user.phone ? `+234 ${formatPhone(user.phone)}` : ''} disabled />
          <Text style={styles.help}>To change your number, contact support.</Text>
        </View>

        <TextField
          label="School email"
          placeholder="you@stu.ui.edu.ng"
          leadingIcon="mail"
          trailingIcon={trimmedEmail && !emailError ? 'check' : undefined}
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button label="Save changes" fullWidth disabled={!canSave} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space['2xl'], gap: space.xl },
  photo: { alignItems: 'center', gap: space.md },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bg.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...type.h2, color: colors.text.accent },
  changePhoto: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  link: { ...type.captionStrong, color: colors.text.accent },
  help: { ...type.caption, color: colors.text.tertiary },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md },
});