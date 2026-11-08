// src/hooks/useDeviceInsets.ts
// The phone's REAL safe-area insets (notch, home bar).
// Most screens get "banner-aware" insets from the root layout (their top inset includes the
// live-trip banner). Full-screen trip screens draw over the banner, so they need the real ones.
import { createContext, useContext } from 'react';
import { EdgeInsets, initialWindowMetrics } from 'react-native-safe-area-context';

const fallback: EdgeInsets = initialWindowMetrics?.insets ?? { top: 0, bottom: 0, left: 0, right: 0 };

export const DeviceInsetsContext = createContext<EdgeInsets>(fallback);

export const useDeviceInsets = () => useContext(DeviceInsetsContext);