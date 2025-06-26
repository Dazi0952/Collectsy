// app/(tabs)/add.tsx - WERSJA Z OBSŁUGĄ ZDJĘĆ
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView, Platform } from 'react-native';
import React, { useState } from 'react';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function AddItemScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);

  // Funkcja do wybierania zdjęć z galerii
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Pozwól na wybór wielu zdjęć
      quality: 0.5,
    });

    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  // Funkcja do wysyłania pojedynczego pliku
  const uploadImage = async (image: ImagePicker.ImagePickerAsset) => {
    if (!image.uri) {
      throw new Error("No image uri");
    }
    
    // Expo ma problemy z wysyłaniem plików na Androidzie, to jest obejście
    const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

    const fileExt = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
    const path = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('itemimages')
      .upload(path, arraybuffer, {
        contentType: image.mimeType ?? `image/${fileExt}`,
      });

    if (error) {
      throw error;
    }

    return data.path;
  };

  const handleAddItem = async () => {
    if (!name || !user || images.length === 0) {
        Alert.alert("Błąd", "Wypełnij nazwę i dodaj przynajmniej jedno zdjęcie.");
        return;
    };
    setLoading(true);

    try {
      // 1. Wyślij wszystkie zdjęcia i zbierz ich ścieżki
      const uploadedPaths = await Promise.all(
        images.map(image => uploadImage(image))
      );
      
      // 2. Pobierz publiczne URL-e dla wysłanych zdjęć
      const imageUrls = uploadedPaths.map(path => {
        const { data } = supabase.storage.from('itemimages').getPublicUrl(path);
        return data.publicUrl;
      });

      // 3. Zapisz dane przedmiotu w bazie danych
      const { error: insertError } = await supabase.from('items').insert({
        name: name,
        description: description,
        user_id: user.id,
        image_urls: imageUrls,
      });

      if (insertError) throw insertError;

      Alert.alert('Sukces!', 'Przedmiot został dodany.');
      router.back(); // Wróć do poprzedniego ekranu

    } catch (error: any) {
      Alert.alert('Błąd', error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nazwa przedmiotu</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Opis</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />

      <Button title="Wybierz zdjęcia z galerii" onPress={pickImage} />

      {/* Podgląd wybranych zdjęć */}
      <View style={styles.imageContainer}>
          {images.map(img => (
              <Image key={img.uri} source={{ uri: img.uri }} style={styles.image} />
          ))}
      </View>

      <View style={{marginTop: 20}}>
        <Button title={loading ? "Dodawanie..." : "Dodaj przedmiot"} onPress={handleAddItem} disabled={loading} />
      </View>
    </ScrollView>
  );
}

// Zaktualizowane style
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  imageContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 16,
  },
  image: {
      width: 100,
      height: 100,
      borderRadius: 8,
      margin: 5,
  }
});