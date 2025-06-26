// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '../../src/constants/theme';

// Możesz zaimportować ikony, jeśli masz zainstalowane @expo/vector-icons
// import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.textSecondary,
    tabBarStyle: { backgroundColor: Colors.background },
    headerStyle: { backgroundColor: Colors.background },
    headerTitleStyle: { color: Colors.text },
  }}>
      <Tabs.Screen
        name="profile"
        options={{
            title: 'Mój Profil',
            }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Odkrywaj',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={color} />
          ),
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