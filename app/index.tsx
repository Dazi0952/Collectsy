// app/index.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collectsy</Text>
      <Text style={styles.subtitle}>Wszystkie Twoje kolekcje w jednym miejscu.</Text>

      <Link href="/login" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Zaloguj się</Text>
        </Pressable>
      </Link>

      <Link href="/register" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Zarejestruj się</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 18, color: 'gray', marginBottom: 64, textAlign: 'center' },
  button: { backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10, alignItems: 'center', width: '90%', marginBottom: 16 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});