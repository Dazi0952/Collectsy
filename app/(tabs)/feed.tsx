// app/(tabs)/feed.tsx
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/api/supabase';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors , FontSize , Spacing } from '../../src/constants/theme'



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
  container: { flex: 1, backgroundColor: Colors.background },
  itemContainer: {
    flex: 1,
    margin: Spacing.small,
    borderRadius: 12,
    backgroundColor: Colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemName: {
    fontWeight: '600',
    padding: Spacing.small,
    color: Colors.text,
    fontSize: FontSize.subheadline
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