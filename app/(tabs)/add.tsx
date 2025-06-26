// app/(tabs)/add.tsx - PEŁNA, ROZBUDOWANA WERSJA
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView, Switch } from 'react-native';
import React, { useState } from 'react';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function AddItemScreen() {
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* === NOWE POLA W FORMULARZU === */}
      <Text style={styles.label}>Nazwa przedmiotu *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Opis</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />
      
      <Text style={styles.label}>Autor</Text>
      <TextInput style={styles.input} value={author} onChangeText={setAuthor} />

      <Text style={styles.label}>Rok</Text>
      <TextInput 
        style={styles.input} 
        value={year} 
        onChangeText={setYear}
        keyboardType="numeric" // Klawiatura numeryczna
      />

      {/* === PRZEŁĄCZNIK "NA SPRZEDAŻ" === */}
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Wystaw na sprzedaż</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isForSale ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={setIsForSale}
          value={isForSale}
        />
      </View>

      {/* === WARUNKOWE POLE CENY === */}
      {isForSale && (
        <>
          <Text style={styles.label}>Cena (PLN)</Text>
          <TextInput 
            style={styles.input} 
            value={price} 
            onChangeText={setPrice} 
            keyboardType="decimal-pad" // Klawiatura numeryczna z kropką/przecinkiem
          />
        </>
      )}

      <Button title="Wybierz zdjęcia z galerii *" onPress={pickImage} />

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

// === NOWE STYLE ===
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    borderColor: 'gray', borderWidth: 1, borderRadius: 8,
    padding: 10, marginBottom: 16, fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageContainer: {
      flexDirection: 'row', flexWrap: 'wrap', marginTop: 16,
  },
  image: {
      width: 100, height: 100, borderRadius: 8, margin: 5,
  }
});