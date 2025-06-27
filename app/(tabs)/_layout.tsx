// app/(tabs)/_layout.tsx
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, lightTheme, darkTheme } from '../../src/constants/theme';
import { Pressable } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

// Możesz zaimportować ikony, jeśli masz zainstalowane @expo/vector-icons
// import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  return (
    <Tabs
      screenOptions={{
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: { backgroundColor: colors.background,
                   borderTopColor: colors.border                 
                },
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { color: colors.text },
    headerTintColor: colors.primary, // Kolor strzałki "wstecz
  }}>
      <Tabs.Screen
        name="profile"
        options={{
            title: 'Mój Profil',
            tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),headerRight: () => {
            const router = useRouter();
            return (
              <Pressable onPress={() => router.push('/settings')}>
                <Ionicons 
                  name="settings-outline" 
                  size={24} 
                  color={Colors.primary} 
                  style={{ marginRight: Spacing.medium }}
                />
              </Pressable>
            );
          },
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