// app/item/edit.tsx
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/api/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EditItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Pobieramy ID z parametrów URL

  // Stany dla formularza
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // ... w przyszłości można dodać edycję innych pól

  const [loading, setLoading] = useState(true);

  // Efekt do pobrania danych przedmiotu na starcie
  useEffect(() => {
    if (id) {
      fetchItemData();
    }
  }, [id]);

  const fetchItemData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('name, description')
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać danych przedmiotu.');
    } else if (data) {
      // Wypełniamy stany formularza pobranymi danymi
      setName(data.name);
      setDescription(data.description);
    }
    setLoading(false);
  };

  const handleUpdateItem = async () => {
    if (!name) {
      Alert.alert('Błąd', 'Nazwa nie może być pusta.');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('items')
      .update({ name, description }) // Przekazujemy zaktualizowane dane
      .eq('id', id); // Określamy, który wiersz zaktualizować

    setLoading(false);

    if (error) {
      Alert.alert('Błąd', 'Nie udało się zaktualizować przedmiotu.');
    } else {
      Alert.alert('Sukces!', 'Zmiany zostały zapisane.');
      router.back(); // Wróć do ekranu szczegółów
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nazwa przedmiotu</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      
      <Text style={styles.label}>Opis</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />
      
      <Button title="Zapisz zmiany" onPress={handleUpdateItem} disabled={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    borderColor: 'gray', borderWidth: 1, borderRadius: 8,
    padding: 10, marginBottom: 16, fontSize: 16, minHeight: 40
  },
});