// src/app/add-card.tsx — 34 Add a debit card
import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../components/TopBar';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useCards, brandOf, passesLuhn } from '../store/useCards';
import { useBooking } from '../store/useBooking';
import { useUser } from '../store/useUser';
import { colors, space, radius, type } from '../theme';

// Preview: show the first 4 and last 4 digits, dots in between, padded to 16 while typing.
function previewNumber(digits: string) {
  const padded = (digits + '•'.repeat(16)).slice(0, Math.max(16, digits.length));
  const masked = padded
    .split('')
    .map((ch, i) => (i >= 4 && i < padded.length - 4 && ch !== '•' ? '•' : ch))
    .join('');
  return masked.replace(/(.{4})(?=.)/g, '$1 '); // a space after every 4 characters
}

// "0828" → valid if the month is 1–12 and the card hasn't run out yet.
function expiryIsValid(mmyy: string) {
  const month = Number(mmyy.slice(0, 2));
  const year = 2000 + Number(mmyy.slice(2, 4));
  if (month < 1 || month > 12) return false;
  const endOfMonth = new Date(year, month, 0, 23, 59); // day 0 of next month = last day of this one
  return endOfMonth.getTime() >= Date.now();
}

export default function AddCard() {
  const insets = useSafeAreaInsets();
  const addCard = useCards((s) => s.add);
  const setPaymentMethod = useBooking((s) => s.setPaymentMethod);
  const firstName = useUser((s) => s.firstName);
  const lastName = useUser((s) => s.lastName);

  // We store DIGITS only, and add spaces / slashes just for display.
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState(`${firstName} ${lastName}`.trim());
  const [saving, setSaving] = useState(false);

  const brand = brandOf(number);
  const grouped = number.replace(/(\d{4})(?=\d)/g, '$1 '); // "5399 8312 4470 2109"
  const expiryText = expiry.length > 2 ? `${expiry.slice(0, 2)}/${expiry.slice(2)}` : expiry;

  // Only complain once a field looks finished.
  const numberError =
    number.length >= 16
      ? !brand
        ? 'We accept Visa, Mastercard and Verve.'
        : !passesLuhn(number)
        ? 'That card number doesn’t look right. Check for typos.'
        : undefined
      : undefined;
  const expiryError = expiry.length === 4 && !expiryIsValid(expiry) ? 'This card has expired or the date is wrong.' : undefined;

  const canSave =
    number.length >= 16 &&
    !numberError &&
    expiry.length === 4 &&
    !expiryError &&
    cvv.length >= 3 &&
    name.trim() !== '';

  const save = () => {
    if (!brand) return;
    setSaving(true);
    // Pretend the provider charges ₦50 to check the card, then refunds it.
    setTimeout(() => {
      addCard({
        id: String(Date.now()),
        brand,
        last4: number.slice(-4),
        expiry: expiryText,
        name: name.trim().toUpperCase(),
      });
      setPaymentMethod('card'); // a new card becomes how you pay
      setSaving(false);
      router.back();
    }, 1500);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar title="Add a card" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Live preview: everything below is derived from what you've typed so far */}
        <View style={styles.preview}>
          <View style={styles.previewTop}>
            <Text style={styles.previewLabel}>Debit card</Text>
            <View style={styles.previewBrand}>
              {brand && <Text style={styles.previewBrandText}>{brand}</Text>}
              <Icon name="card" size={22} color={colors.text.accent} />
            </View>
          </View>
          <Text style={styles.previewNumber}>{previewNumber(number)}</Text>
          <View style={styles.previewBottom}>
            <Text style={styles.previewMeta} numberOfLines={1}>{name.trim().toUpperCase() || 'YOUR NAME'}</Text>
            <Text style={styles.previewMeta}>{expiryText || 'MM/YY'}</Text>
          </View>
        </View>

        <TextField
          label="Card number"
          placeholder="0000 0000 0000 0000"
          leadingIcon="card"
          value={grouped}
          onChangeText={(t) => setNumber(t.replace(/\D/g, '').slice(0, 19))} // keep digits only
          keyboardType="number-pad"
          error={numberError}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <TextField
              label="Expiry"
              placeholder="MM/YY"
              value={expiryText}
              onChangeText={(t) => setExpiry(t.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              error={expiryError}
            />
          </View>
          <View style={styles.half}>
            <TextField
              label="CVV"
              placeholder="123"
              value={cvv}
              onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry // shows dots instead of the digits
            />
          </View>
        </View>

        <TextField label="Name on card" value={name} onChangeText={setName} autoCapitalize="characters" />

        <View style={styles.note}>
          <Icon name="info" size={20} color={colors.icon.accent} />
          <Text style={styles.noteText}>We’ll charge ₦50 to confirm the card and refund it straight away.</Text>
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.lg }]}>
        <Button
          label={saving ? 'Confirming card…' : 'Save card'}
          fullWidth
          disabled={!canSave}
          loading={saving}
          onPress={save}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space['2xl'], gap: space.lg },
  preview: {
    height: 190,
    padding: space.xl,
    justifyContent: 'space-between',
    borderRadius: radius.xl,
    backgroundColor: colors.bg.brand,
  },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewLabel: { ...type.bodyStrong, color: colors.text.primary },
  previewBrand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  previewBrandText: { ...type.captionStrong, color: colors.text.accent },
  previewNumber: { ...type.h2, color: colors.text.primary, letterSpacing: 1 },
  previewBottom: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
  previewMeta: { ...type.captionStrong, color: colors.text.secondary, flexShrink: 1 },
  row: { flexDirection: 'row', gap: space.md },
  half: { flex: 1 },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
  },
  noteText: { ...type.caption, color: colors.text.secondary, flex: 1 },
  bottom: { paddingHorizontal: space.xl, paddingTop: space.md },
});