
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/api/supabase';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../src/constants/theme';

export default function EditItemScreen() {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  

  const [loading, setLoading] = useState(true);

  
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
      .update({ name, description }) 
      .eq('id', id); 

    setLoading(false);

    if (error) {
      Alert.alert('Błąd', 'Nie udało się zaktualizować przedmiotu.');
    } else {
      Alert.alert('Sukces!', 'Zmiany zostały zapisane.');
      router.back(); 
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        title: 'Edytuj przedmiot',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text }
      }}/>
      <Text style={[styles.label, { color: colors.text }]}>Nazwa przedmiotu</Text>
      <TextInput 
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} 
        value={name} 
        onChangeText={setName} 
        placeholderTextColor={colors.textSecondary}
      />
      
      <Text style={[styles.label, { color: colors.text }]}>Opis</Text>
      <TextInput 
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface, minHeight: 120 }]} 
        value={description} 
        onChangeText={setDescription} 
        multiline 
        placeholderTextColor={colors.textSecondary}
      />
      
      <Button title="Zapisz zmiany" onPress={handleUpdateItem} disabled={loading} color={colors.primary} />
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