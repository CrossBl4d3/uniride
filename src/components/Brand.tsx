// src/components/Brand.tsx
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '../theme';

// The green rounded-square "U" from the splash screen.
export function AppIcon({ size = 96 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        backgroundColor: colors.bg.brand,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.wordmark, fontSize: size * 0.625, lineHeight: size * 0.95, color: colors.text.accent }}>
        U
      </Text>
    </View>
  );
}

export function Wordmark({ size = 48 }: { size?: number }) {
  return (
    <Text style={{ fontFamily: fonts.wordmark, fontSize: size, color: colors.text.accent, textAlign: 'center' }}>
      UniRide
    </Text>
  );
}

// Exported from the Figma "Logo/Google" component.
export function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21.8 10.05H21V10H12V14H17.65C16.85 16.35 14.6 18 12 18C8.7 18 6 15.3 6 12C6 8.7 8.7 6 12 6C13.55 6 14.9 6.6 15.95 7.55L18.8 4.7C17 3.05 14.65 2 12 2C6.45 2 2 6.45 2 12C2 17.55 6.45 22 12 22C17.55 22 22 17.55 22 12C22 11.35 21.95 10.7 21.8 10.05Z" fill="#FFC107" />
      <Path d="M3.15002 7.35L6.45002 9.75C7.35002 7.55 9.50002 6 12 6C13.55 6 14.9 6.6 15.95 7.55L18.8 4.7C17 3.05 14.65 2 12 2C8.15002 2 4.85002 4.15 3.15002 7.35Z" fill="#FF3D00" />
      <Path d="M12 22C14.6 22 16.95 21 18.7 19.4L15.6 16.8C14.5631 17.5822 13.2988 18.0036 12 18C9.39998 18 7.19998 16.35 6.34998 14L3.09998 16.5C4.74998 19.8 8.09998 22 12 22Z" fill="#4CAF50" />
      <Path d="M21.8 10.05H21V10H12V14H17.65C17.2574 15.1149 16.5442 16.089 15.6 16.8L18.7 19.4C18.45 19.6 22 17 22 12C22 11.35 21.95 10.7 21.8 10.05Z" fill="#1976D2" />
    </Svg>
  );
}

// Green-white-green, drawn with three Views — no image needed.
export function NigeriaFlag({ width = 28, height = 20 }: { width?: number; height?: number }) {
  return (
    <View style={{ width, height, borderRadius: 4, overflow: 'hidden', flexDirection: 'row' }}>
      <View style={{ flex: 1, backgroundColor: '#008751' }} />
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
      <View style={{ flex: 1, backgroundColor: '#008751' }} />
    </View>
  );
}