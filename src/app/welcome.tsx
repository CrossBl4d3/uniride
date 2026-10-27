// src/app/welcome.tsx — 02 + 03 Welcome (one swipeable screen)
import { useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { Wordmark, GoogleLogo } from '../components/Brand';
import { colors, space, radius, type } from '../theme';
import { router } from 'expo-router';

const slides = [
  {
    key: 'rides',
    title: 'Student-friendly rides around campus',
    body: 'Book a Keke or cab in seconds and pay student prices.',
    image: require('../../assets/images/first-image.png'),
  },
  {
    key: 'start',
    title: 'Get started',
    body: 'Sign in with your phone number to book your first ride.',
    image: require('../../assets/images/second-image.png'),
  },
];

export default function Welcome() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // An animated number that always equals the current horizontal scroll position.
  // useRef keeps the same value across re-renders instead of recreating it.
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: insets.top + space['2xl'] }]}>
        <Wordmark />

        <Animated.FlatList
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(s) => s.key}
          style={{ flex: 1 }}
          // Pipe every scroll position straight into scrollX, ~60 times a second.
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false, // width & colour can't run on the native thread
          })}
          scrollEventThrottle={16} // 1000ms / 60fps ≈ 16ms between updates
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <Image source={item.image} style={styles.illustration} resizeMode="contain" />
              <View style={styles.copy}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.pager}>
          {slides.map((s, i) => {
            // The scroll positions where: the previous slide, this slide, the next slide is showing.
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            // On this slide → wide & green. Either side → small & white. In between → blended.
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp', // don't go past these values when you over-swipe
            });
            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: [colors.text.primary, colors.bg.accent, colors.text.primary],
              extrapolate: 'clamp',
            });

            return <Animated.View key={s.key} style={[styles.dot, { width: dotWidth, backgroundColor }]} />;
          })}
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + space.lg }]}>
        <Button
          label="Continue with phone"
          fullWidth
          icon={<Icon name="phone" size={20} color={colors.text.onAccent} />}
          onPress={() => router.push('/sign-in/phone')}
        />
        <Button
          label="Continue with Google"
          variant="secondary"
          fullWidth
          icon={<GoogleLogo />}
          onPress={() => Alert.alert('Google sign-in', 'Needs the backend, so it comes later.')}
        />
        <Text style={styles.legal}>
          By continuing you agree to our <Text style={styles.link}>Terms of Use</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  hero: {
    flex: 1,
    backgroundColor: colors.bg.brand,
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    paddingBottom: space['2xl'],
    overflow: 'hidden',
  },
  slide: { justifyContent: 'center', gap: space['2xl'] },
  illustration: { width: '100%', height: undefined, aspectRatio: 440 / 251 },
  copy: { paddingHorizontal: 28, gap: space.sm },
  title: { ...type.h1, color: colors.text.primary, textAlign: 'center' },
  body: { ...type.body, color: colors.text.primary, textAlign: 'center' },
  pager: { flexDirection: 'row', gap: 6, alignSelf: 'center' },
  dot: { height: 8, borderRadius: 4 },
  actions: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.md },
  legal: { ...type.caption, color: colors.text.secondary, textAlign: 'center' },
  link: { color: colors.text.accent },
});