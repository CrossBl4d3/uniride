// src/components/MapPin.tsx
// The teardrop pin from the Figma "Map/Pin destination" component.
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../theme';

export function MapPin({ size = 64, color = colors.bg.accent }: { size?: number; color?: string }) {
  // Drawn on a 54×74 grid (the pin's shape in Figma), scaled to `size`.
  const height = size * (74 / 54);
  return (
    <Svg width={size} height={height} viewBox="0 0 54 74">
      <Path
        d="M27 0C12.1 0 0 12.1 0 27C0 47.3 27 74 27 74C27 74 54 47.3 54 27C54 12.1 41.9 0 27 0Z"
        fill={color}
      />
      <Circle cx={27} cy={27} r={11} fill={colors.bg.canvas} />
    </Svg>
  );
}