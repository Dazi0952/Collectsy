// app/(tabs)/profile.tsx
import { View, Text, Button, StyleSheet } from 'react-native';
import React from 'react';
import { supabase } from '../../src/api/supabase'; // Poprawna ścieżka do supabase
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Po wylogowaniu, przenieś użytkownika z powrotem do ekranu logowania
    router.replace('/login'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Witaj na swoim profilu!</Text>
      <Text style={styles.subtitle}>Ta sekcja jest chroniona.</Text>
      <Button title="Wyloguj się" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        marginVertical: 20,
    },
});