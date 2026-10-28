// src/app/trip/chat.tsx — 35 Chat with driver
import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, FlatList, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopBar } from '../../components/TopBar';
import { Icon } from '../../components/Icon';
import { Driver } from '../../data/drivers';
import { useTrip } from '../../store/useTrip';
import { useChat, ChatMessage } from '../../store/useChat';
import { clockAt } from '../../utils/format';
import { colors, space, radius, type, fonts } from '../../theme';

const QUICK_REPLIES = ['I’m at the bus stop', 'Coming out now', 'Okay 👍'];

function greetingWord() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// A pretend driver: answers based on keywords in what you sent.
function replyFor(text: string, driver: Driver) {
  const t = text.toLowerCase();
  if (t.includes('bus stop') || t.includes('where')) return 'Okay, I can see the bus stop. I’ll stop right there.';
  if (t.includes('coming')) return 'No wahala, I’ll wait for you.';
  if (t.includes('late') || t.includes('long') || t.includes('far')) return 'Sorry, small traffic at the gate. I’m almost there.';
  if (t.includes('ok') || t.includes('👍') || t.includes('thank')) return '👍';
  return `I’m in a ${driver.color.toLowerCase()}, ${driver.plate}. See you soon.`;
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.from === 'me';
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      <Text style={[styles.text, mine && { color: colors.text.onAccent }]}>{message.text}</Text>
      <Text style={[styles.time, mine && styles.timeMine]}>{clockAt(message.at)}</Text>
    </View>
  );
}

export default function Chat() {
  const insets = useSafeAreaInsets();
  const trip = useTrip();
  const chat = useChat();
  const driver = trip.driver;
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (driver) chat.open(trip.receipt, `${greetingWord()}! I’m on my way to ${trip.pickupName}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, trip.receipt]);

  if (!driver) {
    return (
      <View style={styles.screen}>
        <TopBar title="Chat" />
        <Text style={styles.note}>Chat opens once a driver accepts your ride.</Text>
      </View>
    );
  }

  const vehicle = trip.rideType === 'keke' ? 'Keke' : 'Cab';
  const eta = Math.max(1, Math.ceil((1 - trip.progress) * trip.awayMin));
  const status =
    trip.status === 'arriving' ? `Arriving in ${eta} min`
    : trip.status === 'arrived' ? `Waiting at ${trip.pickupName}`
    : trip.status === 'onTrip' ? 'On trip'
    : 'Driver assigned';

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    chat.send(clean, replyFor(clean, driver));
    setDraft('');
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TopBar title={driver.name} />
      <Text style={styles.status}>
        {vehicle} · {driver.plate} · {status}
      </Text>

      <FlatList
        ref={listRef}
        data={chat.messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <Bubble message={item} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        // Every time the list grows (a new message), scroll to the newest one.
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          <Text style={styles.note}>
            Messages and calls are masked. {driver.firstName} won’t see your phone number.
          </Text>
        }
        ListFooterComponent={
          chat.typing ? (
            <View style={[styles.bubble, styles.theirs]}>
              <Text style={styles.typing}>{driver.firstName} is typing…</Text>
            </View>
          ) : null
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickScroll}
        contentContainerStyle={styles.quick}
        keyboardShouldPersistTaps="handled"
      >
        {QUICK_REPLIES.map((q) => (
          <Pressable key={q} style={styles.quickChip} onPress={() => send(q)}>
            <Text style={styles.quickText}>{q}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.inputRow, { paddingBottom: insets.bottom + space.sm }]}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={`Message ${driver.firstName}`}
          placeholderTextColor={colors.text.tertiary}
          selectionColor={colors.border.focus}
          returnKeyType="send"
          onSubmitEditing={() => send(draft)}
        />
        <Pressable
          style={[styles.sendButton, !draft.trim() && { opacity: 0.4 }]}
          disabled={!draft.trim()}
          onPress={() => send(draft)}
          accessibilityLabel="Send message"
        >
          <Icon name="navigation" size={20} color={colors.text.onAccent} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  status: { ...type.captionStrong, color: colors.text.accent, textAlign: 'center', marginTop: -space.xs },
  note: { ...type.caption, color: colors.text.tertiary, textAlign: 'center', marginVertical: space.lg },
  list: { paddingHorizontal: space.xl, paddingBottom: space.md },
  bubble: {
    maxWidth: '78%',
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: space.sm,
    borderRadius: radius.lg,
  },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.bg.accent, borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.bg.surfaceRaised, borderBottomLeftRadius: 4 },
  text: { ...type.body, color: colors.text.primary },
  time: { ...type.caption, color: colors.text.secondary },
  timeMine: { color: colors.text.onAccent, opacity: 0.7 },
  typing: { ...type.body, color: colors.text.secondary, fontStyle: 'italic' },
  quickScroll: { flexGrow: 0 },
  quick: { gap: space.sm, paddingHorizontal: space.xl, paddingVertical: space.sm },
  quickChip: {
    height: 32,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  quickText: { ...type.captionStrong, color: colors.text.secondary },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.xl, paddingTop: space.sm },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.bg.surfaceRaised,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text.primary,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});