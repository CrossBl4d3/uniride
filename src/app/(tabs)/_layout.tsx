// src/app/(tabs)/_layout.tsx
// Every screen in this folder becomes a tab. The order here is the order in the bar.
import { Tabs } from 'expo-router';
import { TabBar } from '../../components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="rides" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}