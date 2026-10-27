// src/app/sign-in/details.tsx — 06 Sign in: Tell us about you
import { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { colors, space, type } from '../../theme';

// Basic email shape check: something@something.something
const looksLikeEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s);
// Nigerian school emails end in .edu.ng (e.g. stu.ui.edu.ng)
const isSchoolEmail = (s: string) => s.toLowerCase().endsWith('.edu.ng');

export default function YourDetails() {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const trimmedEmail = email.trim();
  // Only complain once they've typed something — an empty optional field is fine.
  let emailError: string | undefined;
  if (trimmedEmail && !looksLikeEmail(trimmedEmail)) {
    emailError = 'That doesn’t look like an email address.';
  } else if (trimmedEmail && !isSchoolEmail(trimmedEmail)) {
    emailError = 'Use your school email (ending in .edu.ng) to get student fares.';
  }

  const canContinue = firstName.trim() !== '' && lastName.trim() !== '' && !emailError;

  return (
    // KeyboardAvoidingView shrinks the screen when the keyboard opens,
    // so the Continue button rides up above it instead of hiding behind it.
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled" // a tap on Continue works even while typing
      >
        <Text style={styles.title}>Tell us about you</Text>
        <Text style={styles.subtitle}>
          Drivers only see your first name. A school email unlocks student fares.
        </Text>

        <View style={styles.form}>
          <TextField
            label="First name"
            placeholder="Tobi"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="next"
          />
          <TextField
            label="Last name"
            placeholder="Adeyemi"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoComplete="family-name"
            textContentType="familyName"
            returnKeyType="next"
          />
          <View style={styles.emailGroup}>
            <TextField
              label="School email (optional)"
              placeholder="you@stu.ui.edu.ng"
              leadingIcon="mail"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="done"
            />
            {/* Show the hint only once there's a valid school email */}
            {trimmedEmail !== '' && !emailError && (
              <Chip icon="mail" label="We’ll email you a link to verify" />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button
          label="Continue"
          fullWidth
          disabled={!canContinue}
          onPress={() => Alert.alert(`Welcome, ${firstName.trim()}!`, 'Choosing your campus comes next.')}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.sm },
  title: { ...type.h1, color: colors.text.primary },
  subtitle: { ...type.body, color: colors.text.secondary },
  form: { gap: space.xl, marginTop: space.xl },
  emailGroup: { gap: space.md },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.lg },
});