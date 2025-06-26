// app/(tabs)/feed.tsx
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/api/supabase';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';



// Użyjemy tego samego typu 'Item' co na ekranie profilu
type Item = {
  id: string;
  name: string;
  image_urls: string[];
};

export default function FeedScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublicItems();
  }, []);

  const fetchPublicItems = async () => {
    setLoading(true);
    
    // Pobieramy WSZYSTKIE przedmioty od WSZYSTKICH użytkowników
    const { data, error } = await supabase
      .from('items')
      .select('id, name, image_urls') // Pobieramy tylko potrzebne dane do siatki
      .order('created_at', { ascending: false }); // Najnowsze na górze

    if (error) {
      console.error(error);
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  const filteredItems = items.filter(item => 
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <View style={styles.container}>
    {/* === NOWA SEKCJA WYSZUKIWARKI === */}
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Szukaj przedmiotów..."
        value={searchQuery}
        onChangeText={setSearchQuery} // Aktualizuj stan przy każdej zmianie tekstu
      />
    </View>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2} // Dla odmiany użyjmy 2 kolumn
        renderItem={({ item }) => (
          <Link href={`/item/${item.id}`} asChild>
            <Pressable style={styles.itemContainer}>
              <Image source={{ uri: item.image_urls[0] }} style={styles.itemImage} />
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              {item.image_urls.length > 1 && (
                <Ionicons
                  name="copy-outline"
                  size={18}
                  color="white"
                  style={styles.collectionIcon}
                />
              )}
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak przedmiotów do odkrycia.</Text>
        }
      />
    </View>
  );
}

// Nowe, dopasowane style dla ekranu Feed
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  itemContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    elevation: 3, // Cień na Androidzie
    shadowColor: '#000', // Cień na iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1, // Kwadratowy obrazek
  },
  itemName: {
    fontWeight: '600',
    padding: 8,
  },
  collectionIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
});