// app/login.tsx
import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logowanie</Text>
      {/* Tutaj w przyszłości dodamy pola na email i hasło */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});