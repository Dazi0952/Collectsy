// app/profile/[id].tsx
import React from 'react';
import { Text, View } from 'react-native';
import UserProfile from '../../src/components/profile/UserProfile'; // Poprawna ścieżka
import { useLocalSearchParams, Stack } from 'expo-router';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Jeśli z jakiegoś powodu ID nie zostało przekazane, pokaż błąd
  if (!id) {
    return (
      <View>
        <Text>Nie znaleziono profilu. Brak ID.</Text>
      </View>
    );
  }

  return (
    <>
      {/* Stack.Screen pozwala nam dynamicznie ustawić tytuł nagłówka */}
      <Stack.Screen options={{ title: 'Profil użytkownika' }} /> 
      <UserProfile userId={id} />
    </>
  );
}