// src/app/(tabs)/account.tsx — 27 Account
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Chip } from '../../components/Chip';
import { ListRow } from '../../components/ListRow';
import { useTabBarHeight } from '../../components/TabBar';
import { campuses } from '../../data/campuses';
import { savedPlaces } from '../../data/places';
import { useUser } from '../../store/useUser';
import { signOutEverywhere } from '../../store/session';
import { formatPhone } from '../../utils/format';
import { colors, space, radius, type } from '../../theme';

export default function Account() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const user = useUser();

  const campus = campuses.find((c) => c.id === user.campusId);
  const isStudent = user.email.toLowerCase().endsWith('.edu.ng');
  const name = `${user.firstName} ${user.lastName}`.trim() || 'UniRide rider';
  const initials = ((user.firstName[0] ?? '') + (user.lastName[0] ?? '')).toUpperCase() || 'U';

  const comingSoon = (what: string) => () => Alert.alert(what, 'This comes in Stage 7.');

  const confirmLogOut = () =>
    Alert.alert('Log out?', 'You’ll need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          signOutEverywhere();
          if (router.canDismiss()) router.dismissAll();
          router.replace('/welcome');
        },
      },
    ]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg, paddingBottom: tabBarHeight + space.xl }]}
    >
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={{ flex: 1, gap: space.xs }}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {user.phone ? <Text style={styles.meta}>+234 {formatPhone(user.phone)}</Text> : null}
          {isStudent && campus && (
            <Chip variant="accent" icon="check" label={`Verified student · ${campus.id.toUpperCase()}`} />
          )}
        </View>
        <Pressable style={styles.editButton} onPress={() => router.push('/personal-info')} accessibilityLabel="Edit profile">
          <Icon name="edit" size={18} />
        </Pressable>
      </View>

      <Text style={styles.overline}>Account</Text>
      <View style={styles.card}>
        <ListRow icon="user" title="Personal info" chevron onPress={() => router.push('/personal-info')} />
        <ListRow
          icon="pin"
          title="Saved places"
          subtitle={savedPlaces.map((s) => s.label).join(', ')}
          chevron
          onPress={comingSoon('Saved places')}
        />
        <ListRow icon="card" title="Payment methods" subtitle="Wallet, Visa •••• 4417" chevron onPress={comingSoon('Payment methods')} />
        <ListRow
          icon="school"
          title="Student verification"
          trailingText={isStudent ? 'Verified' : 'Add school email'}
          trailingAccent={isStudent}
          divider={false}
          onPress={isStudent ? undefined : () => router.push('/personal-info')}
        />
      </View>

      <Text style={styles.overline}>Safety & support</Text>
      <View style={styles.card}>
        <ListRow icon="shield" title="Safety toolkit" subtitle="SOS, trusted contacts" chevron onPress={() => router.push('/safety')} />
        <ListRow icon="bell" title="Notifications" chevron onPress={comingSoon('Notifications')} />
        <ListRow icon="help" title="Help & support" chevron onPress={comingSoon('Help & support')} />
        <Pressable onPress={confirmLogOut} style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}>
          <View style={styles.logoutIcon}>
            <Icon name="logout" size={22} color={colors.status.error} />
          </View>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  content: { paddingHorizontal: space.xl, gap: space.md },
  profile: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.md },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bg.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...type.h2, color: colors.text.accent },
  name: { ...type.h2, color: colors.text.primary },
  meta: { ...type.body, color: colors.text.secondary },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overline: { ...type.overline, color: colors.text.tertiary, marginTop: space.md },
  card: {
    paddingHorizontal: space.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    backgroundColor: colors.bg.surface,
  },
  logout: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg.errorSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { ...type.bodyStrong, color: colors.status.error },
});