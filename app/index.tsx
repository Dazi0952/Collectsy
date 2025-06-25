// app/index.tsx
import { View, Text, StyleSheet, Button } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Witaj w Collectsy!</Text>
      <Text style={styles.subtitle}>Zarządzaj swoją kolekcją.</Text>
      
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

// WAŻNE: Wklej poniżej te style
import { Pressable } from 'react-native'; // Dodaj ten import na górze

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});