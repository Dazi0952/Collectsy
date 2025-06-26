// app/register.tsx - WERSJA DLA SUPABASE
import { Text, View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../src/api/supabase'; // Importujemy nasz klient Supabase

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Wprowadź email i hasło.');
      return;
    }
    setLoading(true);

    // Tak wygląda rejestracja w Supabase!
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Błąd rejestracji', error.message);
    } else {
      // W Supabase po rejestracji trzeba potwierdzić email.
      // Na razie wyświetlamy komunikat i cofamy.
      Alert.alert('Sukces!', 'Sprawdź swoją skrzynkę mailową, aby potwierdzić rejestrację.');
      if (router.canGoBack()) {
        router.back();
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stwórz konto</Text>
      {/* Reszta JSX jest identyczna jak w wersji Firebase */}
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
        placeholder="Hasło (min. 6 znaków)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Rejestrowanie...' : 'Zarejestruj się'}</Text>
      </Pressable>
    </View>
  );
}
// Style są takie same jak poprzednio
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    input: { height: 50, borderColor: 'gray', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 16, fontSize: 16 },
    button: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});