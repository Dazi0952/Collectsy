// app/(tabs)/add.tsx - PEŁNA, ROZBUDOWANA WERSJA
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView, Switch, Pressable } from 'react-native';
import React, { useState } from 'react';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../src/context/ThemeContext';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AddItemScreen() {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const { user } = useAuth();
  const router = useRouter();

  // === NOWE STANY DLA DODATKOWYCH PÓL ===
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [author, setAuthor] = useState('');
  const [isForSale, setIsForSale] = useState(false);
  const [price, setPrice] = useState('');

  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // ... (ta funkcja pozostaje bez zmian)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  const uploadImage = async (image: ImagePicker.ImagePickerAsset) => {
    // ... (ta funkcja pozostaje bez zmian)
    if (!image.uri) throw new Error("No image uri");
    const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());
    const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
    const path = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('itemimages').upload(path, arraybuffer, {
      contentType: image.mimeType ?? `image/${fileExt}`,
    });
    if (error) throw error;
    return data.path;
  };

  const handleAddItem = async () => {
    if (!name || !user || images.length === 0) {
        Alert.alert("Błąd", "Wypełnij nazwę i dodaj przynajmniej jedno zdjęcie.");
        return;
    };
    setLoading(true);

    try {
      // 1. Wysyłanie zdjęć (bez zmian)
      const uploadedPaths = await Promise.all(images.map(image => uploadImage(image)));
      const imageUrls = uploadedPaths.map(path => {
        const { data } = supabase.storage.from('itemimages').getPublicUrl(path);
        return data.publicUrl;
      });

      // === ZAKTUALIZOWANY OBIEKT DO ZAPISU ===
      const newItem = {
        name: name,
        description: description,
        user_id: user.id,
        image_urls: imageUrls,
        year: year ? parseInt(year, 10) : null, // Konwertujemy na liczbę lub null
        author: author || null,
        is_for_sale: isForSale,
        price: isForSale && price ? parseFloat(price) : null, // Cenę zapisujemy tylko, gdy jest na sprzedaż
      };

      // 2. Zapis do bazy danych
      const { error: insertError } = await supabase.from('items').insert(newItem);
      if (insertError) throw insertError;

      Alert.alert('Sukces!', 'Przedmiot został dodany.');
      router.back();

    } catch (error: any) {
      Alert.alert('Błąd', error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={{ paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ 
        title: 'Dodaj nowy przedmiot',
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text }
      }}/>

      <Text style={[styles.label, { color: colors.text }]}>Nazwa przedmiotu *</Text>
      <TextInput 
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} 
        value={name} 
        onChangeText={setName} 
        placeholder="np. Karta Charizard"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.text }]}>Opis</Text>
      <TextInput 
        style={[styles.input, styles.multiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} 
        value={description} 
        onChangeText={setDescription} 
        multiline 
        placeholder="np. Edycja limitowana z 1999 roku..."
        placeholderTextColor={colors.textSecondary}
      />
      
      <Text style={[styles.label, { color: colors.text }]}>Autor</Text>
      <TextInput 
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} 
        value={author} 
        onChangeText={setAuthor} 
        placeholder="np. The Pokémon Company"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.text }]}>Rok</Text>
      <TextInput 
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} 
        value={year} 
        onChangeText={setYear}
        keyboardType="numeric"
        placeholder="np. 1999"
        placeholderTextColor={colors.textSecondary}
      />

      <View style={styles.switchContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Wystaw na sprzedaż</Text>
        <Switch
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={isForSale ? colors.background : colors.surface}
          onValueChange={setIsForSale}
          value={isForSale}
        />
      </View>

      {isForSale && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Cena (PLN)</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} 
            value={price} 
            onChangeText={setPrice} 
            keyboardType="decimal-pad"
            placeholder="np. 150.00"
            placeholderTextColor={colors.textSecondary}
          />
        </>
      )}

      <Pressable style={[styles.imageButton, { backgroundColor: colors.surface }]} onPress={pickImage}>
        <Ionicons name="images-outline" size={24} color={colors.primary} />
        <Text style={[styles.imageButtonText, { color: colors.primary }]}>
          {images.length > 0 ? `Wybrano ${images.length} zdjęć` : 'Wybierz zdjęcia z galerii *'}
        </Text>
      </Pressable>

      <View style={styles.imageContainer}>
          {images.map(img => (
              <Image key={img.uri} source={{ uri: img.uri }} style={styles.image} />
          ))}
      </View>

      <View style={{marginTop: Spacing.large}}>
        <Button title={loading ? "Dodawanie..." : "Dodaj przedmiot"} onPress={handleAddItem} disabled={loading} color={colors.primary} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.medium },
  label: { fontSize: FontSize.body, fontWeight: '600', marginBottom: Spacing.small },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.medium,
    paddingVertical: 12,
    marginBottom: Spacing.medium,
    fontSize: FontSize.body,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.medium,
    paddingVertical: Spacing.small,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightTheme.primary, // Używamy lightTheme, bo to kolor brandowy
    borderStyle: 'dashed',
    marginBottom: Spacing.medium,
  },
  imageButtonText: {
    marginLeft: Spacing.small,
    fontSize: FontSize.body,
    fontWeight: '600',
  },
  imageContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
  },
  image: {
      width: 100,
      height: 100,
      borderRadius: 8,
      margin: 5,
  }
});