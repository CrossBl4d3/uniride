// src/app/(tabs)/_layout.tsx
// Every screen in this folder becomes a tab. The order here is the order in the bar.
import { Tabs } from 'expo-router';
import { TabBar } from '../../components/TabBar';
import { colors } from '../../theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      // sceneStyle = the background behind each tab. Default is white, which flashed
      // at the bottom of Home during transitions.
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg.canvas } }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="rides" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}