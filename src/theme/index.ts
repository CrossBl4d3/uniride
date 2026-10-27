// theme/index.ts
// Single source of truth for UniRide's look. Values come straight from the
// Figma variables and text styles, so code and design stay in sync.

const palette = {
  richBlack: '#021B1A',
  darkGreen: '#032221',
  bangladeshGreen: '#03624C',
  mountainMeadow: '#2CC295',
  antiFlashWhite: '#F1F7F6',
  pine: '#06302B',
  basil: '#0B453A',
  forest: '#095544',
  frog: '#17876D',
  stone: '#707D7D',
  pistachio: '#AACBC4',
  white: '#FFFFFF',
  amber: '#F5B83D',
  coral: '#FF6B5E',
  sky: '#5AB8FF',
};

// Components use these semantic names, never raw palette values.
// If the accent ever changes again, we change one line here.
export const colors = {
  bg: {
    canvas: palette.richBlack,
    screen: palette.darkGreen,
    surface: palette.pine,
    surfaceRaised: palette.basil,
    brand: palette.bangladeshGreen,
    accent: palette.mountainMeadow,
    accentSubtle: 'rgba(44, 194, 149, 0.14)',
    overlay: 'rgba(2, 27, 26, 0.72)',
    errorSubtle: 'rgba(255, 107, 94, 0.14)',
    warningSubtle: 'rgba(245, 184, 61, 0.14)',
  },
  text: {
    primary: palette.antiFlashWhite,
    secondary: palette.pistachio,
    tertiary: palette.stone,
    accent: palette.mountainMeadow,
    onAccent: palette.richBlack,
    brandLight: palette.mountainMeadow,
  },
  border: {
    hairline: 'rgba(241, 247, 246, 0.08)',
    subtle: palette.basil,
    default: palette.forest,
    strong: palette.frog,
    focus: palette.mountainMeadow,
  },
  status: {
    success: palette.mountainMeadow,
    warning: palette.amber,
    error: palette.coral,
    info: palette.sky,
  },
  map: { route: palette.mountainMeadow, rider: palette.sky },
  icon: {
    default: palette.antiFlashWhite,
    muted: palette.pistachio,
    accent: palette.mountainMeadow,
  },
};

export const space = {
  xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  '2xl': 24, '3xl': 32, '4xl': 40, '5xl': 48,
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, pill: 999 };

// Font family names must match the keys we load in app/_layout.tsx.
export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  wordmark: 'KonkhmerSleokchher_400Regular',
};

export const type = {
  wordmarkLarge: { fontFamily: fonts.wordmark, fontSize: 48 },
  wordmarkSmall: { fontFamily: fonts.wordmark, fontSize: 26 },
  h1: { fontFamily: fonts.semibold, fontSize: 28, lineHeight: 36, letterSpacing: -0.5 },
  h2: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 26 },
  bodyLarge: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
  captionStrong: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
  overline: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 16, letterSpacing: 0.9, textTransform: 'uppercase' as const },
  price: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 32, letterSpacing: -0.5 },
  display: { fontFamily: fonts.bold, fontSize: 44, lineHeight: 52, letterSpacing: -1 },
};