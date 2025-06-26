// app/settings.tsx
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import React from 'react';
import { supabase } from '../src/api/supabase';
import { useRouter, Stack } from 'expo-router';
import { Colors, Spacing } from '../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Błąd", "Nie udało się wylogować.");
    } else {
      // 'replace' czyści historię nawigacji i przenosi do ekranu powitalnego
      router.replace('/'); 
    }
  };

  return (
    <View style={styles.container}>
      {/* Ustawiamy tytuł nagłówka dla tego ekranu */}
      <Stack.Screen options={{ title: 'Ustawienia' }} />
      
      <View style={styles.section}>
        {/* Tutaj w przyszłości można dodać więcej opcji */}
      </View>

      <Button title="Wyloguj się" color={Colors.danger} onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.medium,
    justifyContent: 'space-between' // Rozmieszcza elementy
  },
  section: {
    flex: 1,
  }
});