import { Text, View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { lightTheme, darkTheme } from '../src/constants/theme'
import { useTheme } from '../src/context/ThemeContext'
import { supabase } from '../src/api/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola.');
      return;
    }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      Alert.alert('Błąd rejestracji', authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      Alert.alert('Błąd', 'Nie udało się utworzyć użytkownika.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username: username.toLowerCase().trim(),
    });

    if (profileError) {
      Alert.alert('Błąd', 'Nie udało się zapisać profilu: ' + profileError.message);
    } else {
      Alert.alert('Sukces!', 'Sprawdź swoją skrzynkę mailową, aby potwierdzić rejestrację.');
      router.back();
    }

    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Stwórz konto</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Nazwa użytkownika"
        placeholderTextColor={colors.textSecondary}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Adres e-mail"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Hasło (min. 6 znaków)"
        placeholderTextColor={colors.textSecondary}
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
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { height: 50, borderColor: 'gray', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});