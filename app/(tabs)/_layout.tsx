// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

// Możesz zaimportować ikony, jeśli masz zainstalowane @expo/vector-icons
// import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF', // Kolor aktywnej zakładki
        headerShown: true, // Pokażemy nagłówki na ekranach
      }}>
      <Tabs.Screen
        name="profile"
        options={{
            title: 'Mój Profil',
            }}
      />
      {<Tabs.Screen
        name="add"
        options={{
            title: 'Dodaj',
            }}
        />}

    </Tabs>
  );
}