import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView, Switch, Pressable } from 'react-native';
import React, { useCallback, useState } from 'react';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../src/context/ThemeContext';
import { lightTheme, darkTheme, Spacing, FontSize } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AddItemScreen() {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [author, setAuthor] = useState('');
  const [isForSale, setIsForSale] = useState(false);
  const [price, setPrice] = useState('');
  const [collections, setCollections] = useState<{id: string; name: string}[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [userCollections, setUserCollections] = useState<{ id: string, name: string }[]>([]);

  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
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
  }
  setLoading(true);

  try {
    let collectionId: string | null = null;
    const collectionName = newCollectionName.trim();

    
    if (collectionName !== '') {
      
      const { data: existingCollection, error: findError } = await supabase
        .from('collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', collectionName) 
        .single(); 

      if (findError && findError.code !== 'PGRST116') { 
        throw findError;
      }
      
      if (existingCollection) {
        
        collectionId = existingCollection.id;
        console.log('Znaleziono istniejącą kolekcję, ID:', collectionId);
      } else {
        
        const { data: newCollection, error: createError } = await supabase
          .from('collections')
          .insert({ name: collectionName, user_id: user.id })
          .select('id')
          .single();
        
        if (createError) throw createError;

        collectionId = newCollection.id;
        console.log('Stworzono nową kolekcję, ID:', collectionId);
      }
    }
    
    
    const uploadedPaths = await Promise.all(images.map(image => uploadImage(image)));
    const imageUrls = uploadedPaths.map(path => {
      const { data } = supabase.storage.from('itemimages').getPublicUrl(path);
      return data.publicUrl;
    });

    
    const newItem = {
      name: name,
      description: description,
      user_id: user.id,
      image_urls: imageUrls,
      year: year ? parseInt(year, 10) : null,
      author: author || null,
      is_for_sale: isForSale,
      price: isForSale && price ? parseFloat(price) : null,
      collection_id: collectionId, 
    };

    
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


useFocusEffect(
  useCallback(() => {
    const fetchCollections = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('collections')
        .select('id, name')
        .eq('user_id', user.id);
      
      if (data) {
        setUserCollections(data);
      }
    };
    fetchCollections();
  }, [user])
);


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
      <Text style={[styles.label, { color: colors.text }]}>Kolekcja</Text>
      <TextInput 
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} 
        value={newCollectionName} 
        onChangeText={setNewCollectionName}
        placeholder="Wpisz nazwę nowej lub wybierz z listy"
        placeholderTextColor={colors.textSecondary}
      />

        {userCollections.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsHeader, { color: colors.textSecondary }]}>Twoje kolekcje:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {userCollections.map((collection) => (
              <Pressable 
                key={collection.id} 
                style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setNewCollectionName(collection.name)}
              >
            <Text style={{ color: colors.text }}>{collection.name}</Text>
              </Pressable>
                ))}
              </ScrollView>
          </View>
        )}
      
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
    borderColor: lightTheme.primary, 
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
  },
  suggestionsContainer: {
  marginBottom: Spacing.medium,
  },
  suggestionsHeader: {
  fontSize: FontSize.caption,
  marginBottom: Spacing.small,
  },
  suggestionChip: {
  paddingVertical: Spacing.small,
  paddingHorizontal: Spacing.medium,
  borderRadius: 20,
  borderWidth: 1,
  marginRight: Spacing.small,
},
});