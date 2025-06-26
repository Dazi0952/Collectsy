// app/login.tsx - WERSJA DLA SUPABASE
import { Text, View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../src/api/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Wprowadź email i hasło.');
      return;
    }
    setLoading(true);

    // Tak wygląda logowanie w Supabase!
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Błąd logowania', error.message);
    } else {
      // Logowanie udane! Przekierowujemy do głównej części aplikacji.
      // 'replace' sprawia, że użytkownik nie może cofnąć się do ekranu logowania.
      router.replace('/(tabs)/profile'); // Na razie ta ścieżka nie istnieje, ale to OK
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zaloguj się</Text>
      <TextInput
        style={styles.input}
        placeholder="Adres e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logowanie...' : 'Zaloguj się'}</Text>
      </Pressable>
    </View>
  );
}

// Użyjmy tych samych stylów co przy rejestracji
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    input: { height: 50, borderColor: 'gray', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 16, fontSize: 16 },
    button: { backgroundColor: '#28a745', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});